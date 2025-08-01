import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Shield, Send, Key, Hash, Clock, Fingerprint, AlertCircle, CheckCircle2 } from 'lucide-react';
import { encryptRequest, sendEncryptedRequest, type EncryptionResult } from '@/utils/encryption';

interface EncryptionStepProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  isCompleted: boolean;
  isActive: boolean;
}

const EncryptionStep: React.FC<EncryptionStepProps> = ({ icon, title, description, isCompleted, isActive }) => (
  <div className={`flex items-start space-x-3 p-3 rounded-lg transition-all duration-300 ${
    isActive ? 'bg-primary/10 border border-primary/20' : 
    isCompleted ? 'bg-accent/10 border border-accent/20' : 'bg-muted/50'
  }`}>
    <div className={`p-2 rounded-full ${
      isCompleted ? 'bg-accent text-accent-foreground' : 
      isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
    }`}>
      {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : icon}
    </div>
    <div>
      <h4 className="text-sm font-medium">{title}</h4>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  </div>
);

export const EncryptionDemo: React.FC = () => {
  const [jsonInput, setJsonInput] = useState('{\n  "username": "alice",\n  "action": "transfer",\n  "amount": 1000,\n  "recipient": "bob"\n}');
  const [encryptionResult, setEncryptionResult] = useState<EncryptionResult | null>(null);
  const [response, setResponse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const { toast } = useToast();

  const encryptionSteps = [
    { icon: <Key className="h-4 w-4" />, title: "Generate AES Key", description: "Random 256-bit session key" },
    { icon: <Shield className="h-4 w-4" />, title: "Encrypt Data", description: "AES-256-GCM encryption" },
    { icon: <Hash className="h-4 w-4" />, title: "Encrypt Key", description: "RSA public key encryption" },
    { icon: <Fingerprint className="h-4 w-4" />, title: "Generate Signature", description: "HMAC-SHA256 authentication" },
    { icon: <Send className="h-4 w-4" />, title: "Send Request", description: "Secure transmission" }
  ];

  const handleEncrypt = async () => {
    try {
      JSON.parse(jsonInput); // Validate JSON
      setIsLoading(true);
      setCurrentStep(0);
      setResponse(null);

      // Simulate step-by-step process
      for (let i = 0; i < encryptionSteps.length - 1; i++) {
        setCurrentStep(i);
        await new Promise(resolve => setTimeout(resolve, 600));
      }

      const result = encryptRequest(JSON.parse(jsonInput));
      setEncryptionResult(result);
      setCurrentStep(4);

      toast({
        title: "Encryption Complete",
        description: "Request encrypted successfully",
      });
    } catch (error) {
      toast({
        title: "Encryption Failed",
        description: error instanceof Error ? error.message : "Invalid JSON format",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendRequest = async () => {
    if (!encryptionResult) return;

    try {
      setIsLoading(true);
      const result = await sendEncryptedRequest(encryptionResult);
      setResponse(result);
      
      toast({
        title: "Request Sent",
        description: "Encrypted request sent successfully",
      });
    } catch (error) {
      toast({
        title: "Request Failed",
        description: error instanceof Error ? error.message : "Failed to send request",
        variant: "destructive",
      });
      
      // Mock response for demo when server is not available
      setResponse({
        status: "success",
        message: "This is a mock response (server not available)",
        data: { processed: true, timestamp: new Date().toISOString() }
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center space-x-2">
          <Shield className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Secure Request Encryption Demo</h1>
        </div>
        <p className="text-muted-foreground">
          Demonstrates AES-256-GCM encryption with RSA key exchange and HMAC authentication
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>JSON Data Input</CardTitle>
              <CardDescription>
                Enter the JSON data you want to encrypt and send securely
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder="Enter JSON data..."
                className="min-h-[200px] font-mono text-sm"
              />
              <Button 
                onClick={handleEncrypt} 
                disabled={isLoading || !jsonInput.trim()}
                variant="security"
                className="w-full"
              >
                {isLoading ? "Encrypting..." : "Encrypt Request"}
              </Button>
            </CardContent>
          </Card>

          {/* Encryption Process */}
          <Card>
            <CardHeader>
              <CardTitle>Encryption Process</CardTitle>
              <CardDescription>
                Real-time visualization of the encryption steps
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {encryptionSteps.map((step, index) => (
                <EncryptionStep
                  key={index}
                  icon={step.icon}
                  title={step.title}
                  description={step.description}
                  isCompleted={currentStep > index}
                  isActive={currentStep === index && isLoading}
                />
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Output Section */}
        <div className="space-y-6">
          {/* Encrypted Request Display */}
          {encryptionResult && (
            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Encrypted Request</span>
                </CardTitle>
                <CardDescription>
                  Headers and encrypted payload ready for transmission
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      Timestamp
                    </Badge>
                    <code className="text-xs font-mono bg-muted px-2 py-1 rounded">
                      {encryptionResult.timestamp}
                    </code>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      <Hash className="h-3 w-3 mr-1" />
                      Nonce
                    </Badge>
                    <code className="text-xs font-mono bg-muted px-2 py-1 rounded truncate max-w-[200px]">
                      {encryptionResult.nonce}
                    </code>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <Badge variant="outline" className="text-xs mb-2">
                      <Key className="h-3 w-3 mr-1" />
                      Encrypted AES Key
                    </Badge>
                    <div className="bg-muted p-3 rounded text-xs font-mono break-all">
                      {encryptionResult.encryptedKey}
                    </div>
                  </div>
                  
                  <div>
                    <Badge variant="outline" className="text-xs mb-2">
                      <Fingerprint className="h-3 w-3 mr-1" />
                      HMAC Signature
                    </Badge>
                    <div className="bg-muted p-3 rounded text-xs font-mono break-all">
                      {encryptionResult.signature}
                    </div>
                  </div>
                  
                  <div>
                    <Badge variant="outline" className="text-xs mb-2">
                      <Shield className="h-3 w-3 mr-1" />
                      Encrypted Payload
                    </Badge>
                    <div className="bg-muted p-3 rounded text-xs font-mono break-all max-h-32 overflow-y-auto">
                      {encryptionResult.encryptedData}
                    </div>
                  </div>
                </div>
                
                <Button 
                  onClick={handleSendRequest}
                  disabled={isLoading}
                  className="w-full"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {isLoading ? "Sending..." : "Send Encrypted Request"}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Response Display */}
          {response && (
            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  {response.status === 'success' ? (
                    <CheckCircle2 className="h-5 w-5 text-accent" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-destructive" />
                  )}
                  <span>Server Response</span>
                </CardTitle>
                <CardDescription>
                  Decrypted response from the secure endpoint
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-lg">
                  <pre className="text-sm font-mono whitespace-pre-wrap">
                    {JSON.stringify(response, null, 2)}
                  </pre>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};