import crypto from "crypto";
import Razorpay from "razorpay";
import PDFDocument from "pdfkit";

import Payment from "../models/Payment.js";
import Subscription from "../models/Subscription.js";
import Plan from "../models/Plan.js";
import Exam from "../models/Exam.js";

/*
|--------------------------------------------------------------------------
| Razorpay Helper
|--------------------------------------------------------------------------
| Razorpay is initialized only when a payment order is actually created.
| This prevents the entire server from crashing if environment variables
| are missing during startup.
|--------------------------------------------------------------------------
*/

const getRazorpay = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error("Razorpay environment variables are missing");
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
};

/*
|--------------------------------------------------------------------------
| Get Applicable Plan Price
|--------------------------------------------------------------------------
| If an active festival/special offer exists, use offerPrice.
| Otherwise, use the regular plan price.
|--------------------------------------------------------------------------
*/

const getApplicablePrice = (plan) => {
  const now = new Date();

  const offerIsActive =
    plan.offerPrice !== null &&
    plan.offerPrice !== undefined &&
    plan.offerStartDate &&
    plan.offerEndDate &&
    now >= new Date(plan.offerStartDate) &&
    now <= new Date(plan.offerEndDate);

  if (offerIsActive) {
    return {
      amount: plan.offerPrice,
      isOfferActive: true,
      offerName: plan.offerName,
    };
  }

  return {
    amount: plan.price,
    isOfferActive: false,
    offerName: null,
  };
};

/*
|--------------------------------------------------------------------------
| CREATE PAYMENT ORDER
|--------------------------------------------------------------------------
| Student sends:
|
| {
|   "planId": "..."
| }
|--------------------------------------------------------------------------
*/

export const createPaymentOrder = async (req, res) => {
  try {
    const { planId } = req.body;

    // Validate plan ID
    if (!planId) {
      return res.status(400).json({
        success: false,
        message: "Plan ID is required",
      });
    }

    // Find active plan
    const plan = await Plan.findOne({
      _id: planId,
      isActive: true,
    }).populate("examId", "name category isActive");

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Active plan not found",
      });
    }

    // Validate associated exam
    if (!plan.examId || !plan.examId.isActive) {
      return res.status(404).json({
        success: false,
        message: "Associated exam is not available",
      });
    }

    // Only Premium plans require payment
    if (plan.name !== "Premium") {
      return res.status(400).json({
        success: false,
        message: "Only Premium plans require payment",
      });
    }

    // Get current applicable price
    const pricing = getApplicablePrice(plan);

    if (
      !Number.isFinite(pricing.amount) ||
      pricing.amount <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid plan price",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Initialize Razorpay here
    |--------------------------------------------------------------------------
    */

    const razorpay = getRazorpay();

    // Razorpay expects amount in paise
    const amountInPaise = Math.round(pricing.amount * 100);

    // Unique receipt
    const receipt = `LP_${Date.now()}_${req.user._id
      .toString()
      .slice(-6)}`;

    /*
    |--------------------------------------------------------------------------
    | Create Razorpay Order
    |--------------------------------------------------------------------------
    */

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt,

      notes: {
        userId: req.user._id.toString(),
        planId: plan._id.toString(),
        examId: plan.examId._id.toString(),
        planName: plan.name,
        examName: plan.examId.name,
        offerName: pricing.offerName || "No Offer",
      },
    });

    /*
    |--------------------------------------------------------------------------
    | Store Payment Record
    |--------------------------------------------------------------------------
    */

    const payment = await Payment.create({
      userId: req.user._id,
      examId: plan.examId._id,
      planId: plan._id,
      planName: plan.name,
      amount: pricing.amount,
      currency: "INR",
      razorpayOrderId: order.id,
      status: "created",
    });

    /*
    |--------------------------------------------------------------------------
    | Response
    |--------------------------------------------------------------------------
    */

    return res.status(201).json({
      success: true,
      message: "Payment order created successfully",

      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
      },

      plan: {
        id: plan._id,
        name: plan.name,

        examId: plan.examId._id,
        examName: plan.examId.name,

        regularPrice: plan.price,

        offerPrice: pricing.isOfferActive
          ? pricing.amount
          : null,

        offerName: pricing.offerName,
        isOfferActive: pricing.isOfferActive,

        finalAmount: pricing.amount,

        durationDays: plan.durationDays,
        features: plan.features,
      },

      payment: {
        id: payment._id,
        status: payment.status,
      },

      // Safe to send Key ID to frontend.
      // NEVER send Razorpay secret.
      razorpayKeyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Create payment order error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create payment order",
    });
  }
};

/*
|--------------------------------------------------------------------------
| VERIFY RAZORPAY PAYMENT
|--------------------------------------------------------------------------
*/

export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    // Validate request
    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment verification details are required",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Find payment belonging to logged-in student
    |--------------------------------------------------------------------------
    */

    const payment = await Payment.findOne({
      razorpayOrderId: razorpay_order_id,
      userId: req.user._id,
    }).populate("examId", "name category");

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment order not found",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Prevent duplicate verification
    |--------------------------------------------------------------------------
    */

    if (payment.status === "paid") {
      return res.status(200).json({
        success: true,
        message: "Payment already verified",

        payment: {
          id: payment._id,
          status: payment.status,
          razorpayPaymentId: payment.razorpayPaymentId,
        },
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Validate Razorpay Secret
    |--------------------------------------------------------------------------
    */

    if (!process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({
        success: false,
        message: "Razorpay secret configuration is missing",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Generate Signature
    |--------------------------------------------------------------------------
    */

    const generatedSignature = crypto
      .createHmac(
        "sha256",
        process.env.RAZORPAY_KEY_SECRET
      )
      .update(
        `${razorpay_order_id}|${razorpay_payment_id}`
      )
      .digest("hex");

    /*
    |--------------------------------------------------------------------------
    | Safe Signature Comparison
    |--------------------------------------------------------------------------
    */

    const generatedBuffer = Buffer.from(
      generatedSignature,
      "utf8"
    );

    const receivedBuffer = Buffer.from(
      razorpay_signature,
      "utf8"
    );

    if (
      generatedBuffer.length !== receivedBuffer.length ||
      !crypto.timingSafeEqual(
        generatedBuffer,
        receivedBuffer
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Mark Payment as Paid
    |--------------------------------------------------------------------------
    */

    payment.razorpayPaymentId = razorpay_payment_id;
    payment.razorpaySignature = razorpay_signature;
    payment.status = "paid";
    payment.paymentDate = new Date();

    await payment.save();

    /*
|--------------------------------------------------------------------------
| Activate Premium Subscription
|--------------------------------------------------------------------------
*/

const plan = await Plan.findById(payment.planId);

if (!plan) {
  return res.status(404).json({
    success: false,
    message: "Associated plan not found",
  });
}

const startDate = new Date();

const endDate = new Date(startDate);
endDate.setDate(
  endDate.getDate() + plan.durationDays
);

/*
|--------------------------------------------------------------------------
| Check Existing Active Subscription
|--------------------------------------------------------------------------
*/

let subscription = await Subscription.findOne({
  userId: req.user._id,
  examId: payment.examId._id,
  status: "active",
});

/*
|--------------------------------------------------------------------------
| Extend Existing Subscription
|--------------------------------------------------------------------------
*/

if (subscription) {
  const existingEndDate = new Date(
    subscription.endDate
  );

  const baseDate =
    existingEndDate > startDate
      ? existingEndDate
      : startDate;

  const extendedEndDate = new Date(baseDate);

  extendedEndDate.setDate(
    extendedEndDate.getDate() + plan.durationDays
  );

  subscription.planId = plan._id;
  subscription.paymentId = payment._id;
  subscription.planName = plan.name;
  subscription.amount = payment.amount;
  subscription.endDate = extendedEndDate;
  subscription.status = "active";

  await subscription.save();
} else {
  /*
  |--------------------------------------------------------------------------
  | Create New Subscription
  |--------------------------------------------------------------------------
  */

  subscription = await Subscription.create({
    userId: req.user._id,
    examId: payment.examId._id,
    planId: plan._id,
    paymentId: payment._id,
    planName: plan.name,
    amount: payment.amount,
    startDate,
    endDate,
    status: "active",
  });
}

    /*
    |--------------------------------------------------------------------------
    | Response
    |--------------------------------------------------------------------------
    */

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully",

      payment: {
        id: payment._id,

        examId: payment.examId?._id,
        examName: payment.examId?.name,

        planId: payment.planId,
        planName: payment.planName,

        amount: payment.amount,
        currency: payment.currency,

        razorpayOrderId: payment.razorpayOrderId,
        razorpayPaymentId: payment.razorpayPaymentId,

        status: payment.status,
        paymentDate: payment.paymentDate,
      },
    });
  } catch (error) {
    console.error("Verify payment error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to verify payment",
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET STUDENT PAYMENT HISTORY
|--------------------------------------------------------------------------
*/

export const getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({
      userId: req.user._id,
    })
      .populate("examId", "name category")
      .populate(
        "planId",
        "name price offerPrice offerName durationDays"
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: payments.length,
      payments,
    });
  } catch (error) {
    console.error(
      "Get payment history error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch payment history",
    });
  }
};

/*
|--------------------------------------------------------------------------
| DOWNLOAD PAYMENT RECEIPT
|--------------------------------------------------------------------------
*/

export const downloadReceipt = async (req, res) => {
  try {
    const { paymentId } = req.params;

    /*
    |--------------------------------------------------------------------------
    | Find paid payment belonging to logged-in student
    |--------------------------------------------------------------------------
    */

    const payment = await Payment.findOne({
      _id: paymentId,
      userId: req.user._id,
      status: "paid",
    })
      .populate("examId", "name category")
      .populate(
        "planId",
        "name price offerPrice offerName durationDays"
      );

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Paid payment receipt not found",
      });
    }

    const user = req.user;

    /*
    |--------------------------------------------------------------------------
    | PDF Response Headers
    |--------------------------------------------------------------------------
    */

    res.setHeader(
      "Content-Type",
      "application/pdf"
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="LakshyaPath-Receipt-${payment.razorpayPaymentId}.pdf"`
    );

    /*
    |--------------------------------------------------------------------------
    | Create PDF
    |--------------------------------------------------------------------------
    */

    const doc = new PDFDocument({
      size: "A4",
      margin: 50,
    });

    doc.pipe(res);

    /*
    |--------------------------------------------------------------------------
    | Header
    |--------------------------------------------------------------------------
    */

    doc
      .fontSize(25)
      .font("Helvetica-Bold")
      .text("LAKSHYAPATH", {
        align: "center",
      });

    doc
      .fontSize(10)
      .font("Helvetica")
      .text(
        "Competitive Examination Preparation Platform",
        {
          align: "center",
        }
      );

    doc.moveDown(1);

    doc
      .fontSize(18)
      .font("Helvetica-Bold")
      .text("PAYMENT RECEIPT", {
        align: "center",
      });

    doc.moveDown(2);

    /*
    |--------------------------------------------------------------------------
    | Payment Details
    |--------------------------------------------------------------------------
    */

    const receiptDate = payment.paymentDate
      ? new Date(
          payment.paymentDate
        ).toLocaleString("en-IN")
      : "-";

    const regularPrice =
      payment.planId?.price ?? payment.amount;

    const offerWasUsed =
      payment.planId?.offerPrice !== null &&
      payment.planId?.offerPrice !== undefined &&
      payment.amount < regularPrice;

    const details = [
      [
        "Receipt ID",
        payment._id.toString(),
      ],

      [
        "Student Name",
        user.fullName || "-",
      ],

      [
        "Email",
        user.email || "-",
      ],

      [
        "Exam",
        payment.examId?.name || "-",
      ],

      [
        "Category",
        payment.examId?.category || "-",
      ],

      [
        "Plan",
        payment.planName,
      ],

      [
        "Regular Price",
        `INR ${regularPrice.toFixed(2)}`,
      ],
    ];

    if (offerWasUsed) {
      details.push([
        "Offer",
        payment.planId?.offerName ||
          "Special Offer",
      ]);
    }

    details.push(
      [
        "Amount Paid",
        `INR ${payment.amount.toFixed(2)}`,
      ],

      [
        "Currency",
        payment.currency,
      ],

      [
        "Razorpay Order ID",
        payment.razorpayOrderId,
      ],

      [
        "Razorpay Payment ID",
        payment.razorpayPaymentId,
      ],

      [
        "Payment Date",
        receiptDate,
      ],

      [
        "Payment Status",
        "PAID",
      ]
    );

    /*
    |--------------------------------------------------------------------------
    | Render Details
    |--------------------------------------------------------------------------
    */

    details.forEach(([label, value]) => {
      doc
        .font("Helvetica-Bold")
        .text(`${label}:`, {
          continued: true,
        })
        .font("Helvetica")
        .text(` ${value}`);

      doc.moveDown(0.5);
    });

    /*
    |--------------------------------------------------------------------------
    | Premium Access
    |--------------------------------------------------------------------------
    */

    doc.moveDown(1.5);

    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .text("Premium Access");

    doc.moveDown(0.5);

    doc
      .fontSize(10)
      .font("Helvetica")
      .text(
        `Premium plan duration: ${
          payment.planId?.durationDays || "-"
        } days.`
      );

    /*
    |--------------------------------------------------------------------------
    | Confirmation
    |--------------------------------------------------------------------------
    */

    doc.moveDown(2);

    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .text("Payment Confirmation");

    doc.moveDown(0.7);

    doc
      .fontSize(10)
      .font("Helvetica")
      .text(
        "This receipt confirms that the above payment was " +
          "successfully processed through Razorpay for " +
          "the LakshyaPath Premium plan."
      );

    /*
    |--------------------------------------------------------------------------
    | Footer
    |--------------------------------------------------------------------------
    */

    doc.moveDown(3);

    doc
      .fontSize(10)
      .text(
        "Thank you for choosing LakshyaPath.",
        {
          align: "center",
        }
      );

    doc
      .fontSize(9)
      .text(
        "Discipline. Preparation. Consistency. Achievement.",
        {
          align: "center",
        }
      );

    doc.end();
  } catch (error) {
    console.error(
      "Download receipt error:",
      error
    );

    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: "Failed to generate payment receipt",
      });
    }
  }
};