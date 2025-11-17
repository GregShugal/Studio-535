import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { Loader2, ArrowLeft, Calculator, DollarSign, Clock, Package } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { getLoginUrl } from "@/const";

export default function QuoteBuilder() {
  const { user, loading: authLoading } = useAuth();
  const [projectId, setProjectId] = useState("");
  const [laborHours, setLaborHours] = useState("0");
  const [hourlyRate, setHourlyRate] = useState("75");
  const [materialCost, setMaterialCost] = useState("0");
  const [markupPercentage, setMarkupPercentage] = useState("20");
  const [additionalCosts, setAdditionalCosts] = useState("0");
  const [notes, setNotes] = useState("");

  // Redirect if not authenticated
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-[#8B6F47]" />
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    window.location.href = getLoginUrl();
    return null;
  }

  // Calculate totals
  const laborCost = parseFloat(laborHours) * parseFloat(hourlyRate);
  const materials = parseFloat(materialCost);
  const additional = parseFloat(additionalCosts);
  const subtotal = laborCost + materials + additional;
  const markup = subtotal * (parseFloat(markupPercentage) / 100);
  const total = subtotal + markup;

  const createQuoteMutation = trpc.quotes.create.useMutation({
    onSuccess: () => {
      toast.success("Quote created successfully");
      // Reset form
      setProjectId("");
      setLaborHours("0");
      setMaterialCost("0");
      setAdditionalCosts("0");
      setNotes("");
    },
    onError: (error) => {
      toast.error(`Failed to create quote: ${error.message}`);
    },
  });

  const handleCreateQuote = () => {
    if (!projectId) {
      toast.error("Please enter a project ID");
      return;
    }

    createQuoteMutation.mutate({
      projectId: parseInt(projectId),
      amount: Math.round(total * 100), // Convert to cents
      breakdown: `Labor: ${laborHours}hrs @ $${hourlyRate}/hr = $${laborCost.toFixed(2)}\nMaterials: $${materials.toFixed(2)}\nAdditional: $${additional.toFixed(2)}\nMarkup (${markupPercentage}%): $${markup.toFixed(2)}\n\n${notes}`,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container max-w-4xl py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Quote Builder</h1>
            <p className="text-muted-foreground">Create detailed quotes with automatic calculations</p>
          </div>
        </div>

        <div className="grid gap-6">
          {/* Project Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Project Information</CardTitle>
              <CardDescription>Select the project for this quote</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="projectId">Project ID *</Label>
                  <Input
                    id="projectId"
                    type="number"
                    placeholder="Enter project ID"
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cost Calculator */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Cost Calculator
              </CardTitle>
              <CardDescription>Enter costs and the total will be calculated automatically</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Labor */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-[#8B6F47]" />
                  <h3 className="font-semibold">Labor</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="laborHours">Hours</Label>
                    <Input
                      id="laborHours"
                      type="number"
                      step="0.5"
                      value={laborHours}
                      onChange={(e) => setLaborHours(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
                    <Input
                      id="hourlyRate"
                      type="number"
                      step="5"
                      value={hourlyRate}
                      onChange={(e) => setHourlyRate(e.target.value)}
                    />
                  </div>
                </div>
                <div className="bg-muted rounded-lg p-3">
                  <p className="text-sm font-medium">
                    Labor Cost: <span className="text-[#8B6F47]">${laborCost.toFixed(2)}</span>
                  </p>
                </div>
              </div>

              {/* Materials */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-[#8B6F47]" />
                  <h3 className="font-semibold">Materials</h3>
                </div>
                <div>
                  <Label htmlFor="materialCost">Material Cost ($)</Label>
                  <Input
                    id="materialCost"
                    type="number"
                    step="0.01"
                    value={materialCost}
                    onChange={(e) => setMaterialCost(e.target.value)}
                  />
                </div>
              </div>

              {/* Additional Costs */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-[#8B6F47]" />
                  <h3 className="font-semibold">Additional Costs</h3>
                </div>
                <div>
                  <Label htmlFor="additionalCosts">Additional Costs ($)</Label>
                  <Input
                    id="additionalCosts"
                    type="number"
                    step="0.01"
                    placeholder="Shipping, fees, etc."
                    value={additionalCosts}
                    onChange={(e) => setAdditionalCosts(e.target.value)}
                  />
                </div>
              </div>

              {/* Markup */}
              <div className="space-y-4">
                <h3 className="font-semibold">Markup</h3>
                <div>
                  <Label htmlFor="markupPercentage">Markup Percentage (%)</Label>
                  <Input
                    id="markupPercentage"
                    type="number"
                    step="5"
                    value={markupPercentage}
                    onChange={(e) => setMarkupPercentage(e.target.value)}
                  />
                </div>
                <div className="bg-muted rounded-lg p-3">
                  <p className="text-sm font-medium">
                    Markup Amount: <span className="text-[#8B6F47]">${markup.toFixed(2)}</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quote Summary */}
          <Card className="border-[#8B6F47]">
            <CardHeader className="bg-[#8B6F47]/5">
              <CardTitle>Quote Summary</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Labor ({laborHours} hrs @ ${hourlyRate}/hr)</span>
                  <span>${laborCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Materials</span>
                  <span>${materials.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Additional Costs</span>
                  <span>${additional.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm pt-3 border-t">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Markup ({markupPercentage}%)</span>
                  <span>${markup.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-3 border-t-2 border-[#8B6F47]">
                  <span>Total</span>
                  <span className="text-[#8B6F47]">${total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Notes</CardTitle>
              <CardDescription>Add any special terms, conditions, or details</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Enter any additional notes or terms..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
              />
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-4">
            <Button
              onClick={handleCreateQuote}
              disabled={createQuoteMutation.isPending || !projectId}
              className="flex-1 bg-[#8B6F47] hover:bg-[#6B5437]"
              size="lg"
            >
              {createQuoteMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Quote...
                </>
              ) : (
                "Create Quote"
              )}
            </Button>
            <Link href="/admin">
              <Button variant="outline" size="lg">
                Cancel
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
