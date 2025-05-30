
import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from '@/components/ui/use-toast';
import { Check, Upload, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

interface DocumentType {
  id: string;
  name: string;
  required: boolean;
  trustScoreValue: number;
  uploaded: boolean;
  fileName?: string;
}

const VerificationForm: React.FC = () => {
  const { toast } = useToast();
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  
  // List of verification documents with their trust score values
  const [documents, setDocuments] = useState<DocumentType[]>([
    { id: 'business-registration', name: 'Business Registration Certificate', required: true, trustScoreValue: 1.5, uploaded: false },
    { id: 'tax-certificate', name: 'Tax Registration Certificate', required: true, trustScoreValue: 1.2, uploaded: false },
    { id: 'identity-proof', name: 'Identity Proof (Aadhar/PAN)', required: true, trustScoreValue: 0.8, uploaded: false },
    { id: 'address-proof', name: 'Business Address Proof', required: false, trustScoreValue: 0.5, uploaded: false },
    { id: 'quality-certifications', name: 'Quality/Sustainability Certifications', required: false, trustScoreValue: 1.0, uploaded: false }
  ]);
  
  // Track current verification status
  const [isVerifying, setIsVerifying] = useState(false);
  const [trustScoreGained, setTrustScoreGained] = useState(0);
  const [showTrustScorePopup, setShowTrustScorePopup] = useState(false);
  
  // Handle file input click
  const handleFileInputClick = (documentId: string) => {
    if (fileInputRefs.current[documentId]) {
      fileInputRefs.current[documentId]?.click();
    }
  };
  
  // Handle file change
  const handleFileChange = (documentId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const document = documents.find(doc => doc.id === documentId);
      const updatedDocuments = documents.map(doc => {
        if (doc.id === documentId) {
          if (!doc.uploaded) {
            // Only add the trust score if the document wasn't already uploaded
            const newTrustScore = doc.trustScoreValue;
            setTrustScoreGained(prev => prev + newTrustScore);
            
            // Show trust score popup
            setShowTrustScorePopup(true);
            setTimeout(() => setShowTrustScorePopup(false), 3000);
          }
          return { ...doc, uploaded: true, fileName: file.name };
        }
        return doc;
      });
      
      setDocuments(updatedDocuments);
      
      toast({
        title: "Document Uploaded",
        description: `${file.name} has been uploaded and will be reviewed. Your trust score has increased by +${document?.trustScoreValue.toFixed(1)}.`,
        duration: 5000,
      });
    }
  };
  
  // Submit verification request
  const handleVerificationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if all required documents are uploaded
    const requiredDocsUploaded = documents
      .filter(doc => doc.required)
      .every(doc => doc.uploaded);
    
    if (!requiredDocsUploaded) {
      toast({
        title: "Missing Required Documents",
        description: "Please upload all required documents to complete verification.",
        variant: "destructive",
        duration: 5000,
      });
      return;
    }
    
    setIsVerifying(true);
    
    // Simulate verification process
    setTimeout(() => {
      setIsVerifying(false);
      toast({
        title: "Verification Submitted",
        description: "Your verification documents have been submitted for review. This process typically takes 1-2 business days.",
        duration: 5000,
      });
    }, 2000);
  };
  
  return (
    <form onSubmit={handleVerificationSubmit} className="space-y-4">
      <div className="space-y-4">
        <div className="mb-4">
          <h3 className="text-sm font-medium text-muted-foreground">Upload verification documents to increase your trust score</h3>
          {trustScoreGained > 0 && (
            <motion.div 
              className="text-sm text-green-600 font-medium mt-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <span className="flex items-center">
                <Check className="h-4 w-4 mr-1" />
                Trust score increased by {trustScoreGained.toFixed(1)} points
              </span>
            </motion.div>
          )}
        </div>
        
        <div className="space-y-3">
          {documents.map((doc) => (
            <div key={doc.id} className="flex items-center justify-between rounded-lg border p-3">
              <div className="flex items-center">
                <FileText className="h-5 w-5 text-muted-foreground mr-2" />
                <div>
                  <p className="text-sm font-medium">{doc.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {doc.required ? "Required" : "Optional"} • +{doc.trustScoreValue.toFixed(1)} trust score
                  </p>
                  {doc.fileName && (
                    <p className="text-xs text-green-600">{doc.fileName}</p>
                  )}
                </div>
              </div>
              
              <div>
                <input
                  type="file"
                  className="hidden"
                  ref={el => fileInputRefs.current[doc.id] = el}
                  onChange={(e) => handleFileChange(doc.id, e)}
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                />
                {doc.uploaded ? (
                  <Button
                    variant="outline" 
                    size="sm"
                    className="flex items-center text-emerald-600 border-emerald-600"
                    type="button"
                    onClick={() => handleFileInputClick(doc.id)}
                  >
                    <Upload className="h-4 w-4 mr-1" /> Change
                  </Button>
                ) : (
                  <Button
                    variant="outline" 
                    size="sm"
                    className="flex items-center"
                    type="button"
                    onClick={() => handleFileInputClick(doc.id)}
                  >
                    <Upload className="h-4 w-4 mr-1" /> Browse
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <Button 
        type="submit" 
        className="w-full"
        disabled={isVerifying || !documents.some(doc => doc.uploaded)}
      >
        {isVerifying ? "Processing..." : "Submit for Verification"}
      </Button>

      {trustScoreGained > 0 && (
        <motion.div 
          className="text-center text-sm text-green-600 font-medium"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          Your verification is in process. Current trust score increase: +{trustScoreGained.toFixed(1)} points
        </motion.div>
      )}

      {/* Trust Score Popup */}
      {showTrustScorePopup && (
        <motion.div
          className="fixed top-4 right-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-green-300 z-50"
          initial={{ opacity: 0, y: -20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.8 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        >
          <div className="flex items-center gap-3">
            <div className="bg-green-100 dark:bg-green-900 p-2 rounded-full">
              <Check className="h-5 w-5 text-green-600 dark:text-green-300" />
            </div>
            <div>
              <h4 className="font-medium">Trust Score Updated</h4>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                New Score: {trustScoreGained.toFixed(1)}/5.0
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </form>
  );
};

export default VerificationForm;
