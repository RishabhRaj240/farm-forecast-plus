import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Star, Zap, Crown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const PricingSection = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (plan: string, price: number) => {
    if (plan === 'Free') return;
    
    setLoading(plan);
    
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { plan, priceId: plan === 'Premium' ? 'premium' : 'enterprise' }
      });

      if (error) throw error;
      
      // Open Stripe checkout in new tab
      if (data.url) {
        window.open(data.url, '_blank');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to start checkout process',
        variant: 'destructive'
      });
    } finally {
      setLoading(null);
    }
  };

  const plans = [
    {
      name: 'Free',
      price: 0,
      description: 'Perfect for getting started with basic weather monitoring',
      features: [
        'Single location weather tracking',
        'Basic weather data',
        '5-day forecast',
        'Standard weather alerts',
        'Community support'
      ],
      icon: Star,
      popular: false,
      buttonText: 'Current Plan',
      buttonVariant: 'outline' as const
    },
    {
      name: 'Premium',
      price: 9.99,
      description: 'Advanced features for serious farmers',
      features: [
        'Unlimited location tracking',
        'Detailed weather analytics',
        'Extended 14-day forecast',
        'Custom weather alerts',
        'Soil moisture predictions',
        'Crop-specific recommendations',
        'Priority email support',
        'Weather history & trends'
      ],
      icon: Zap,
      popular: true,
      buttonText: 'Start Premium',
      buttonVariant: 'default' as const
    },
    {
      name: 'Enterprise',
      price: 29.99,
      description: 'Complete solution for large farming operations',
      features: [
        'Everything in Premium',
        'Multi-farm management',
        'Team collaboration tools',
        'API access',
        'Custom integrations',
        'Advanced analytics dashboard',
        'Dedicated account manager',
        'Phone support',
        'Custom reporting',
        'White-label options'
      ],
      icon: Crown,
      popular: false,
      buttonText: 'Contact Sales',
      buttonVariant: 'outline' as const
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold">Choose Your Plan</h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Get the weather insights you need to optimize your farming operations
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {plans.map((plan) => {
          const Icon = plan.icon;
          return (
            <Card 
              key={plan.name} 
              className={`relative ${
                plan.popular 
                  ? 'border-primary shadow-lg scale-105' 
                  : 'border-border'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground px-3 py-1">
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  <div className={`p-3 rounded-full ${
                    plan.popular 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="space-y-2">
                  <div className="text-4xl font-bold">
                    ${plan.price}
                    {plan.price > 0 && <span className="text-lg text-muted-foreground">/month</span>}
                  </div>
                  {plan.price === 0 && (
                    <div className="text-sm text-muted-foreground">Forever free</div>
                  )}
                </div>
                <CardDescription className="text-center">
                  {plan.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <Check className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  variant={plan.buttonVariant}
                  className="w-full"
                  onClick={() => handleSubscribe(plan.name, plan.price)}
                  disabled={loading === plan.name || plan.price === 0}
                >
                  {loading === plan.name ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                      <span>Processing...</span>
                    </div>
                  ) : (
                    plan.buttonText
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* FAQ Section */}
      <div className="space-y-6">
        <h3 className="text-2xl font-bold text-center">Frequently Asked Questions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Can I upgrade or downgrade anytime?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, 
                and you'll be charged or credited accordingly.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Is there a free trial?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Our Free plan gives you access to basic features forever. For Premium features, 
                we offer a 14-day free trial with no credit card required.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">What payment methods do you accept?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                We accept all major credit cards (Visa, MasterCard, American Express) and PayPal. 
                All payments are processed securely through Stripe.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">How accurate is the weather data?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                We source data from multiple premium weather providers and use advanced algorithms 
                to provide highly accurate forecasts specifically tailored for agricultural needs.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Contact Section */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200 dark:border-green-800">
        <CardContent className="text-center py-8">
          <h3 className="text-xl font-bold mb-2">Need a Custom Solution?</h3>
          <p className="text-muted-foreground mb-4">
            Contact our sales team for custom enterprise solutions tailored to your specific needs.
          </p>
          <Button variant="outline">Contact Sales Team</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PricingSection;