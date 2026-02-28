import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, Tag, CheckCircle2, Loader2, ArrowLeft, ShieldCheck, CreditCard, Lock } from "lucide-react";
import { SiRazorpay } from "react-icons/si";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Course {
  id: string;
  title: string;
  category: string;
  price: number;
  thumbnail?: string;
  shortDescription?: string;
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) { resolve(true); return; }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function PaymentPage({ courseId }: { courseId: string }) {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ couponId: string; discount: number; finalAmount: number; discountPercent: number } | null>(null);
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [payLoading, setPayLoading] = useState(false);

  const { data, isLoading } = useQuery<{ course: Course }>({
    queryKey: [`/api/courses/${courseId}`],
  });

  const { data: enrollData } = useQuery<{ enrolled: boolean }>({
    queryKey: [`/api/courses/${courseId}/enrollment`],
  });

  const course = data?.course;
  const finalAmount = appliedCoupon ? appliedCoupon.finalAmount : course?.price ?? 0;

  useEffect(() => {
    if (enrollData?.enrolled) navigate(`/course/${courseId}`);
  }, [enrollData]);

  const applyCoupon = async () => {
    if (!couponCode.trim() || !course) return;
    setCouponError("");
    setCouponLoading(true);
    try {
      const res = await apiRequest("POST", "/api/coupons/apply", { code: couponCode.trim(), coursePrice: course.price });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setAppliedCoupon(data);
    } catch (err: any) {
      setCouponError(err.message || "Invalid coupon");
    } finally {
      setCouponLoading(false);
    }
  };

  const freeEnrollMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/enroll", { courseId, amount: 0, couponId: appliedCoupon?.couponId });
      if (!res.ok) throw new Error((await res.json()).message);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/courses/${courseId}/enrollment`] });
      toast({ title: "Enrollment successful!", description: "You can now access the course." });
      navigate(`/course/${courseId}`);
    },
    onError: (err: any) => toast({ title: "Enrollment failed", description: err.message, variant: "destructive" }),
  });

  const handleRazorpayPayment = async () => {
    if (!course) return;
    setPayLoading(true);

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast({ title: "Error", description: "Failed to load payment gateway. Check your internet connection.", variant: "destructive" });
        setPayLoading(false);
        return;
      }

      const res = await apiRequest("POST", "/api/payment/order", {
        courseId,
        couponId: appliedCoupon?.couponId,
      });
      const orderData = await res.json();
      if (!res.ok) throw new Error(orderData.message);

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Zalgo Edutech",
        description: orderData.courseName,
        order_id: orderData.orderId,
        handler: async (response: any) => {
          try {
            const verifyRes = await apiRequest("POST", "/api/payment/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              courseId,
              finalAmount: orderData.finalAmount,
              couponId: appliedCoupon?.couponId,
            });
            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) throw new Error(verifyData.message);
            queryClient.invalidateQueries({ queryKey: [`/api/courses/${courseId}/enrollment`] });
            toast({ title: "Payment successful!", description: "You are now enrolled in the course." });
            navigate(`/course/${courseId}`);
          } catch (err: any) {
            toast({ title: "Verification failed", description: err.message, variant: "destructive" });
          }
        },
        prefill: {},
        theme: { color: "#006980" },
        modal: { ondismiss: () => setPayLoading(false) },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", (response: any) => {
        toast({ title: "Payment failed", description: response.error?.description ?? "Please try again.", variant: "destructive" });
        setPayLoading(false);
      });
      rzp.open();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
      setPayLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!course) return null;

  const isFree = finalAmount <= 0;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")} data-testid="button-back">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-xl font-bold">Complete Enrollment</h1>
          <p className="text-sm text-muted-foreground">Review your order and proceed</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          {/* Course Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Course</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="w-20 h-14 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  {course.thumbnail ? (
                    <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm leading-snug">{course.title}</h3>
                  <Badge variant="secondary" className="text-xs mt-1">{course.category}</Badge>
                  {course.shortDescription && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{course.shortDescription}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Coupon */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                <Tag className="w-3.5 h-3.5" />
                Promo Code
              </CardTitle>
            </CardHeader>
            <CardContent>
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-medium text-green-700 dark:text-green-400">
                      {appliedCoupon.discountPercent}% off applied
                    </span>
                  </div>
                  <Button
                    size="sm" variant="ghost"
                    onClick={() => { setAppliedCoupon(null); setCouponCode(""); }}
                    className="text-xs h-7"
                    data-testid="button-remove-coupon"
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={e => { setCouponCode(e.target.value.toUpperCase()); setCouponError(""); }}
                    className="flex-1"
                    data-testid="input-coupon"
                  />
                  <Button
                    variant="outline" onClick={applyCoupon}
                    disabled={couponLoading || !couponCode.trim()}
                    data-testid="button-apply-coupon"
                  >
                    {couponLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : "Apply"}
                  </Button>
                </div>
              )}
              {couponError && <p className="text-xs text-destructive mt-2" data-testid="text-coupon-error">{couponError}</p>}
            </CardContent>
          </Card>

          {/* Security badges */}
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5" /> 256-bit SSL secured</div>
            <div className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" /> Razorpay protected</div>
            <div className="flex items-center gap-1.5"><CreditCard className="w-3.5 h-3.5" /> UPI, Cards, Net Banking accepted</div>
          </div>
        </div>

        {/* Order Summary */}
        <div>
          <Card className="sticky top-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Original Price</span>
                <span>₹{course.price.toLocaleString()}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                  <span>Discount ({appliedCoupon.discountPercent}%)</span>
                  <span>-₹{appliedCoupon.discount.toLocaleString()}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span className="text-lg text-primary">₹{finalAmount.toLocaleString()}</span>
              </div>

              {isFree ? (
                <Button
                  className="w-full mt-2" size="default"
                  onClick={() => freeEnrollMutation.mutate()}
                  disabled={freeEnrollMutation.isPending}
                  data-testid="button-enroll"
                >
                  {freeEnrollMutation.isPending ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Processing...</> : "Enroll Free"}
                </Button>
              ) : (
                <Button
                  className="w-full mt-2 gap-2 bg-[#1a1a2e] hover:bg-[#16213e] text-white" size="default"
                  onClick={handleRazorpayPayment}
                  disabled={payLoading}
                  data-testid="button-pay-razorpay"
                >
                  {payLoading ? (
                    <><Loader2 className="w-4 h-4 animate-spin mr-2" />Opening payment...</>
                  ) : (
                    <><SiRazorpay className="w-4 h-4" /> Pay ₹{finalAmount.toLocaleString()}</>
                  )}
                </Button>
              )}

              <Button variant="ghost" className="w-full text-sm" onClick={() => navigate("/dashboard")} data-testid="button-cancel">
                Cancel
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
