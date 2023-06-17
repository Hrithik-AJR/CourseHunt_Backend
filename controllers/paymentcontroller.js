import { catchAsyncerror } from "../middlewares/catchAsyncerror.js";
import { User } from "../models/user.js";
import ErrorHandler from "../utils/errorhandler.js";
import {instance} from "../server.js"
import crypto from "crypto"
import { Payment } from "../models/payment.js";

export const buySubscription = catchAsyncerror(async (req, res, next) => {
    const user = await User.findById(req.user._id);
    if (user.role === "admin")
      return next(new ErrorHandler("Admin can't Buy Subscription", 400));
    const plan_id = process.env.PLAN_ID || "plan_M2tugYTGhtrSjz";
    const subscription = await instance.subscriptions.create({
      plan_id,
      customer_notify: 1,
      total_count: 12,
    });
    user.subscription.id = subscription.id;
    user.subscription.status = subscription.status;
    await user.save();
    res.status(201).json({
      success: true,
      subscriptionId: subscription.id,
    });
  });

  export const paymentVerification = catchAsyncerror(async (req, res, next) => {
    const { razorpay_signature, razorpay_payment_id, razorpay_subscription_id } =
      req.body;
    const user = await User.findById(req.user._id);
    const subscription_id = user.subscription.id;
    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_API_SECRET)
      .update(razorpay_payment_id + "|" + subscription_id, "utf-8")
      .digest("hex");
    const isAuthentic = generated_signature === razorpay_signature;
    if (!isAuthentic)
    return res.redirect(`${process.env.FRONTEND_URL}/paymentfail`);
    await Payment.create({
      razorpay_signature,
      razorpay_payment_id,
      razorpay_subscription_id,
    });
    user.subscription.status = "active";
    await user.save();
  
    res.redirect(
      `${process.env.FRONTEND_URL}/paymentsuccess?reference=${razorpay_payment_id}`
    );
  });

  export const getRazorPayKey = catchAsyncerror(async (req, res, next) => {
    res.status(200).json({
      success: true,
      key: process.env.RAZORPAY_API_KEY,
    });
  });


  export const cancelSubscription = catchAsyncerror(async (req, res, next) => {
    const user = await User.findById(req.user._id);
    const subscriptionId = user.subscription.id;
    let refund = false;
    await instance.subscriptions.cancel(subscriptionId);
  
    // const payment = await Payment.findOne({
    //   razorpay_subscription_id: subscriptionId,
    // });
    // const gap = Date.now() - payment.createdAt;
    // const refundTime = process.env.REFUND_DAYS * 24 * 60 * 60 * 1000;
    // if (refundTime > gap) {
    //   await instance.payments.refund(payment.razorpay_payment_id);
    //   refund = true;
    // }
    // await payment.remove();
    user.subscription.id = undefined;
    user.subscription.status = undefined;
    await user.save();
  
    res.status(200).json({
      success: true,
      message: refund
        ? "Subscription Cancelled, You Will receive full refund within 7 day's."
        : "Subscription Cancelled, No Refund initiated , as subscription was cancelled after 7 day's.",
    });
  });