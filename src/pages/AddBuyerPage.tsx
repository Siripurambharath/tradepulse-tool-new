// pages/AddBuyerPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, X, Save, ArrowLeft, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import "./AddBuyerPage.css"

const AddBuyerPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Form state - Updated field name
  const [formData, setFormData] = useState({
    product: '',
    hsn_code: '',
    country: '',
    company_name: '',
    website: '',
    address: '',
    additional_details: '',  // Changed from details
    suggested_keywords: '',
    hsn_descriptions: '',
    confidence_level: '',
    reason: '',
    classification_notes: '',
    manual_verification: '',
    buyer_date: new Date().toISOString().split('T')[0],
  });

  // Contacts state (phone numbers)
  const [contacts, setContacts] = useState([
    { id: Date.now(), contact_number: '' }
  ]);

  // Emails state
  const [emails, setEmails] = useState([
    { id: Date.now() + 1, email: '' }
  ]);

  // Add new contact field
  const addContact = () => {
    setContacts([...contacts, { id: Date.now(), contact_number: '' }]);
  };

  // Remove contact field
  const removeContact = (id) => {
    if (contacts.length > 1) {
      setContacts(contacts.filter(contact => contact.id !== id));
    } else {
      toast({
        title: "Cannot remove",
        description: "At least one contact number is required",
        variant: "destructive",
      });
    }
  };

  // Update contact
  const updateContact = (id, value) => {
    setContacts(contacts.map(contact =>
      contact.id === id ? { ...contact, contact_number: value } : contact
    ));
  };

  // Add new email field
  const addEmail = () => {
    setEmails([...emails, { id: Date.now(), email: '' }]);
  };

  // Remove email field
  const removeEmail = (id) => {
    if (emails.length > 1) {
      setEmails(emails.filter(email => email.id !== id));
    } else {
      toast({
        title: "Cannot remove",
        description: "At least one email is required",
        variant: "destructive",
      });
    }
  };

  // Update email
  const updateEmail = (id, value) => {
    setEmails(emails.map(email =>
      email.id === id ? { ...email, email: value } : email
    ));
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle select changes
  const handleSelectChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Normalize contacts to a clean array of trimmed, non-empty numbers
  const getNormalizedContacts = () =>
    contacts
      .filter(c => c.contact_number && c.contact_number.trim())
      .map(c => c.contact_number.trim());

  // Normalize emails to a clean array of trimmed, non-empty emails
  const getNormalizedEmails = () =>
    emails
      .filter(e => e.email && e.email.trim())
      .map(e => e.email.trim());

  // Client-side duplicate guard: catches the exact same contact number or
  // email being entered twice within THIS form before it's even submitted.
  // (Server-side check in buyerRoutes.js still guards against duplicates
  // against buyers already saved in the database.)
  const hasInFormDuplicates = () => {
    const contactValues = getNormalizedContacts();
    const emailValues = getNormalizedEmails().map(e => e.toLowerCase());

    const uniqueContacts = new Set(contactValues);
    const uniqueEmails = new Set(emailValues);

    if (uniqueContacts.size !== contactValues.length) {
      toast({
        title: "Duplicate Contact",
        description: "The same contact number has been entered more than once.",
        variant: "destructive",
      });
      return true;
    }

    if (uniqueEmails.size !== emailValues.length) {
      toast({
        title: "Duplicate Email",
        description: "The same email address has been entered more than once.",
        variant: "destructive",
      });
      return true;
    }

    return false;
  };

  // Validate form
  const validateForm = () => {
    // Check required fields
    const requiredFields = ['product', 'hsn_code', 'country', 'company_name'];
    for (let field of requiredFields) {
      if (!formData[field] || !formData[field].trim()) {
        toast({
          title: "Validation Error",
          description: `${field.replace('_', ' ')} is required`,
          variant: "destructive",
        });
        return false;
      }
    }

    // Validate contacts
    const validContacts = contacts.filter(c => c.contact_number && c.contact_number.trim());
    if (validContacts.length === 0) {
      toast({
        title: "Validation Error",
        description: "At least one valid contact number is required",
        variant: "destructive",
      });
      return false;
    }

    // Validate emails
    const validEmails = emails.filter(e => e.email && e.email.trim());
    if (validEmails.length === 0) {
      toast({
        title: "Validation Error",
        description: "At least one valid email is required",
        variant: "destructive",
      });
      return false;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    for (let email of validEmails) {
      if (!emailRegex.test(email.email.trim())) {
        toast({
          title: "Validation Error",
          description: `Invalid email format: ${email.email}`,
          variant: "destructive",
        });
        return false;
      }
    }

    // Check for duplicate contact numbers / emails entered within this form
    if (hasInFormDuplicates()) {
      return false;
    }

    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Filter out empty contacts and emails
      const validContacts = getNormalizedContacts().map(c => ({ contact_number: c }));
      const validEmails = getNormalizedEmails().map(e => ({ email: e }));

      const payload = {
        ...formData,
        contacts: validContacts,
        emails: validEmails,
      };

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('http://localhost:5000/api/buyers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Success",
          description: "Buyer added successfully!",
        });
        navigate('/buyers');
      } else if (result.duplicate) {
        // Server-side duplicate detected (same product + company_name with
        // identical set of contacts and emails already exists in the DB)
        toast({
          title: "Duplicate Buyer",
          description: result.message || "A buyer with the same product, company, contact numbers, and emails already exists.",
          variant: "destructive",
        });
      } else {
        throw new Error(result.message || 'Failed to add buyer');
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast({
        title: "Error",
        description: error.message || 'Failed to add buyer',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/buyers')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Add New Buyer</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Buyer Information</CardTitle>
            <CardDescription>
              Fill in the details below to add a new buyer to the system.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Product and HSN Code */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="product">Product *</Label>
                <Input
                  id="product"
                  name="product"
                  value={formData.product}
                  onChange={handleInputChange}
                  placeholder="Enter product name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hsn_code">HSN Code *</Label>
                <Input
                  id="hsn_code"
                  name="hsn_code"
                  value={formData.hsn_code}
                  onChange={handleInputChange}
                  placeholder="Enter HSN code"
                  required
                />
              </div>
            </div>

            {/* Country and Company Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="country">Country *</Label>
                <Input
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  placeholder="Enter country"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company_name">Company Name *</Label>
                <Input
                  id="company_name"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleInputChange}
                  placeholder="Enter company name"
                  required
                />
              </div>
            </div>

            {/* Website and Buyer Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  name="website"
                  type="url"
                  value={formData.website}
                  onChange={handleInputChange}
                  placeholder="https://example.com"
                />
              </div>
              <div className="space-y-2"> 
                <Label htmlFor="buyer_date">Buyer Date</Label> 
                <div className="relative"> 
                  <Input
                    id="buyer_date"
                    name="buyer_date"
                    type="date"
                    value={formData.buyer_date}
                    onChange={handleInputChange}
                    className="pr-12 h-11 rounded-lg custom-date-input"
                  />
                  <button 
                    type="button" 
                    onClick={() => {
                      const dateInput = document.getElementById("buyer_date");
                      if (dateInput) {
                        dateInput.showPicker?.();
                      }
                    }} 
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-black"
                  >
                    <Calendar className="h-5 w-5" /> 
                  </button> 
                </div> 
              </div>
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Enter complete address"
                rows={2}
              />
            </div>

            {/* Additional Details - Updated field name */}
            <div className="space-y-2">
              <Label htmlFor="additional_details">Additional Details</Label>
              <Textarea
                id="additional_details"
                name="additional_details"
                value={formData.additional_details}
                onChange={handleInputChange}
                placeholder="Enter additional details"
                rows={2}
              />
            </div>

            {/* Suggested Keywords and HSN Descriptions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="suggested_keywords">Suggested Keywords</Label>
                <Input
                  id="suggested_keywords"
                  name="suggested_keywords"
                  value={formData.suggested_keywords}
                  onChange={handleInputChange}
                  placeholder="Enter suggested keywords"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hsn_descriptions">HSN Descriptions</Label>
                <Input
                  id="hsn_descriptions"
                  name="hsn_descriptions"
                  value={formData.hsn_descriptions}
                  onChange={handleInputChange}
                  placeholder="Enter HSN descriptions"
                />
              </div>
            </div>

            {/* Confidence Level and Reason */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="confidence_level">Confidence Level</Label>
                <Select
                  value={formData.confidence_level}
                  onValueChange={(value) => handleSelectChange('confidence_level', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select confidence level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reason">Reason</Label>
                <Input
                  id="reason"
                  name="reason"
                  value={formData.reason}
                  onChange={handleInputChange}
                  placeholder="Enter reason"
                />
              </div>
            </div>

            {/* Classification Notes and Manual Verification */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="classification_notes">Classification Notes</Label>
                <Input
                  id="classification_notes"
                  name="classification_notes"
                  value={formData.classification_notes}
                  onChange={handleInputChange}
                  placeholder="Enter classification notes"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="manual_verification">Manual Verification</Label>
                <Select
                  value={formData.manual_verification}
                  onValueChange={(value) => handleSelectChange('manual_verification', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select verification status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Yes">Yes</SelectItem>
                    <SelectItem value="No">No</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Contacts Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Contact Numbers *</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addContact}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Contact
                </Button>
              </div>
              {contacts.map((contact, index) => (
                <div key={contact.id} className="flex items-center gap-2">
                  <div className="flex-1">
                    <Input
                      value={contact.contact_number}
                      onChange={(e) => updateContact(contact.id, e.target.value)}
                      placeholder={`Contact ${index + 1}`}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeContact(contact.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Emails Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Email Addresses *</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addEmail}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Email
                </Button>
              </div>
              {emails.map((email, index) => (
                <div key={email.id} className="flex items-center gap-2">
                  <div className="flex-1">
                    <Input
                      type="email"
                      value={email.email}
                      onChange={(e) => updateEmail(email.id, e.target.value)}
                      placeholder={`Email ${index + 1}`}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeEmail(email.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Submit Buttons */}
            <div className="pt-6 mt-2 border-t">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="h-12 text-base font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                >
                  <Save className="h-5 w-5 mr-2" />
                  {loading ? "Saving..." : "Save Buyer"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/buyers")}
                  disabled={loading}
                  className="h-12 text-base font-semibold rounded-lg border-2 hover:bg-gray-100 transition-all duration-200"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default AddBuyerPage;