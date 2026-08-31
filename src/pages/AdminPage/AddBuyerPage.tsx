import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, X, Save, ArrowLeft, Calendar, User, Building2, 
  Globe, Phone, Mail, MapPin, FileText, Hash, 
  Package, CheckCircle, AlertCircle, Sparkles,
  ClipboardList, Tag, Shield, Star, Target, Layers,
  Loader2
} from 'lucide-react';
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
import { API_URL } from '@/components/api';

const AddBuyerPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    product: '',
    hsn_code: '',
    country: '',
    company_name: '',
    website: '',
    address: '',
    additional_details: '',
    suggested_keywords: '',
    hsn_descriptions: '',
    confidence_level: '',
    reason: '',
    classification_notes: '',
    manual_verification: '',
    buyer_date: new Date().toISOString().split('T')[0],
  });

  // Contacts state
  const [contacts, setContacts] = useState([
    { id: Date.now(), contact_number: '' }
  ]);

  // Emails state
  const [emails, setEmails] = useState([
    { id: Date.now() + 1, email: '' }
  ]);

  const addContact = () => {
    setContacts([...contacts, { id: Date.now(), contact_number: '' }]);
  };

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

  const updateContact = (id, value) => {
    setContacts(contacts.map(contact =>
      contact.id === id ? { ...contact, contact_number: value } : contact
    ));
  };

  const addEmail = () => {
    setEmails([...emails, { id: Date.now(), email: '' }]);
  };

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

  const updateEmail = (id, value) => {
    setEmails(emails.map(email =>
      email.id === id ? { ...email, email: value } : email
    ));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getNormalizedContacts = () =>
    contacts
      .filter(c => c.contact_number && c.contact_number.trim())
      .map(c => c.contact_number.trim());

  const getNormalizedEmails = () =>
    emails
      .filter(e => e.email && e.email.trim())
      .map(e => e.email.trim());

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

  const validateForm = () => {
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

    const validContacts = contacts.filter(c => c.contact_number && c.contact_number.trim());
    if (validContacts.length === 0) {
      toast({
        title: "Validation Error",
        description: "At least one valid contact number is required",
        variant: "destructive",
      });
      return false;
    }

    const validEmails = emails.filter(e => e.email && e.email.trim());
    if (validEmails.length === 0) {
      toast({
        title: "Validation Error",
        description: "At least one valid email is required",
        variant: "destructive",
      });
      return false;
    }

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

    if (hasInFormDuplicates()) {
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const validContacts = contacts
        .filter(c => c.contact_number && c.contact_number.trim())
        .map(c => ({ contact_number: c.contact_number.trim() }));

      const validEmails = emails
        .filter(e => e.email && e.email.trim())
        .map(e => ({ email: e.email.trim() }));

      const payload = {
        ...formData,
        contacts: validContacts,
        emails: validEmails,
      };

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_URL}/api/buyers`, {
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50/50 via-white to-blue-50/30 px-0 sm:px-4 md:px-6 py-3 sm:py-4 md:py-6">
      {/* Decorative gradient header */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
      
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6 md:mb-8">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/templates')}
              className="hover:bg-blue-50 hover:text-blue-700 transition-colors rounded-xl h-8 sm:h-9 md:h-10 text-xs sm:text-sm px-2 sm:px-3"
            >
              <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden xs:inline">Back</span>
            </Button>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg sm:rounded-xl shadow-lg flex-shrink-0">
                  <User className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white" />
                </div>
                <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent truncate">
                  Add New Buyer
                </h1>
              </div>
              <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground flex items-center gap-1 sm:gap-2 mt-0.5 truncate">
                <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5 flex-shrink-0" />
                <span className="hidden xs:inline">Enter buyer details to add them to the system</span>
                <span className="xs:hidden">Add buyer to system</span>
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="border-0 shadow-xl overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
            
            <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-gray-50/50 to-blue-50/50 p-3 sm:p-4 md:p-5 lg:p-6">
              <CardTitle className="text-base sm:text-lg md:text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent flex items-center gap-2">
                <Building2 className="h-4 w-4 sm:h-4.5 sm:w-4.5 md:h-5 md:w-5 text-blue-600 flex-shrink-0" />
                <span className="truncate">Buyer Information</span>
              </CardTitle>
              <CardDescription className="text-[10px] sm:text-xs md:text-sm truncate">
                Fill in the details below to add a new buyer
              </CardDescription>
            </CardHeader>
            
            <CardContent className="p-3 sm:p-4 md:p-5 lg:p-6 space-y-4 sm:space-y-5 md:space-y-6">
              {/* Product and HSN Code */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-5">
                <div className="space-y-1.5 sm:space-y-2">
                  <Label className="text-[10px] sm:text-xs md:text-sm font-medium text-gray-700 flex items-center gap-1.5 sm:gap-2">
                    <Package className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 text-blue-500 flex-shrink-0" />
                    <span className="truncate">Product</span>
                    <span className="text-red-500 text-[10px] sm:text-xs">*</span>
                  </Label>
                  <Input
                    id="product"
                    name="product"
                    value={formData.product}
                    onChange={handleInputChange}
                    placeholder="Enter product name"
                    className="border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 rounded-xl transition-all duration-200 h-9 sm:h-10 md:h-11 text-xs sm:text-sm"
                    required
                  />
                </div>
                <div className="space-y-1.5 sm:space-y-2">
                  <Label className="text-[10px] sm:text-xs md:text-sm font-medium text-gray-700 flex items-center gap-1.5 sm:gap-2">
                    <Hash className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 text-blue-500 flex-shrink-0" />
                    <span className="truncate">HSN Code</span>
                    <span className="text-red-500 text-[10px] sm:text-xs">*</span>
                  </Label>
                  <Input
                    id="hsn_code"
                    name="hsn_code"
                    value={formData.hsn_code}
                    onChange={handleInputChange}
                    placeholder="Enter HSN code"
                    className="border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 rounded-xl transition-all duration-200 h-9 sm:h-10 md:h-11 text-xs sm:text-sm"
                    required
                  />
                </div>
              </div>

              {/* Country and Company Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-5">
                <div className="space-y-1.5 sm:space-y-2">
                  <Label className="text-[10px] sm:text-xs md:text-sm font-medium text-gray-700 flex items-center gap-1.5 sm:gap-2">
                    <Globe className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 text-blue-500 flex-shrink-0" />
                    <span className="truncate">Country</span>
                    <span className="text-red-500 text-[10px] sm:text-xs">*</span>
                  </Label>
                  <Input
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    placeholder="Enter country"
                    className="border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 rounded-xl transition-all duration-200 h-9 sm:h-10 md:h-11 text-xs sm:text-sm"
                    required
                  />
                </div>
                <div className="space-y-1.5 sm:space-y-2">
                  <Label className="text-[10px] sm:text-xs md:text-sm font-medium text-gray-700 flex items-center gap-1.5 sm:gap-2">
                    <Building2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 text-blue-500 flex-shrink-0" />
                    <span className="truncate">Company Name</span>
                    <span className="text-red-500 text-[10px] sm:text-xs">*</span>
                  </Label>
                  <Input
                    id="company_name"
                    name="company_name"
                    value={formData.company_name}
                    onChange={handleInputChange}
                    placeholder="Enter company name"
                    className="border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 rounded-xl transition-all duration-200 h-9 sm:h-10 md:h-11 text-xs sm:text-sm"
                    required
                  />
                </div>
              </div>

              {/* Website and Buyer Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-5">
                <div className="space-y-1.5 sm:space-y-2">
                  <Label className="text-[10px] sm:text-xs md:text-sm font-medium text-gray-700 flex items-center gap-1.5 sm:gap-2">
                    <Globe className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 text-blue-500 flex-shrink-0" />
                    <span className="truncate">Website</span>
                  </Label>
                  <Input
                    id="website"
                    name="website"
                    type="url"
                    value={formData.website}
                    onChange={handleInputChange}
                    placeholder="https://example.com"
                    className="border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 rounded-xl transition-all duration-200 h-9 sm:h-10 md:h-11 text-xs sm:text-sm"
                  />
                </div>
                <div className="space-y-1.5 sm:space-y-2">
                  <Label className="text-[10px] sm:text-xs md:text-sm font-medium text-gray-700 flex items-center gap-1.5 sm:gap-2">
                    <Calendar className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 text-blue-500 flex-shrink-0" />
                    <span className="truncate">Buyer Date</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="buyer_date"
                      name="buyer_date"
                      type="date"
                      value={formData.buyer_date}
                      onChange={handleInputChange}
                      className="pr-10 sm:pr-12 border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 rounded-xl transition-all duration-200 h-9 sm:h-10 md:h-11 text-xs sm:text-sm"
                    />
                    <button 
                      type="button" 
                      onClick={() => {
                        const dateInput = document.getElementById("buyer_date") as
                          | (HTMLInputElement & { showPicker?: () => void })
                          | null;

                        if (dateInput && typeof dateInput.showPicker === "function") {
                          dateInput.showPicker();
                        }
                      }} 
                      className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 p-0.5 sm:p-1 text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      <Calendar className="h-4 w-4 sm:h-4.5 sm:w-4.5 md:h-5 md:w-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="space-y-1.5 sm:space-y-2">
                <Label className="text-[10px] sm:text-xs md:text-sm font-medium text-gray-700 flex items-center gap-1.5 sm:gap-2">
                  <MapPin className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 text-blue-500 flex-shrink-0" />
                  <span className="truncate">Address</span>
                </Label>
                <Textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Enter complete address"
                  rows={2}
                  className="border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 rounded-xl transition-all duration-200 resize-none text-xs sm:text-sm"
                />
              </div>

              {/* Additional Details */}
              <div className="space-y-1.5 sm:space-y-2">
                <Label className="text-[10px] sm:text-xs md:text-sm font-medium text-gray-700 flex items-center gap-1.5 sm:gap-2">
                  <FileText className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 text-blue-500 flex-shrink-0" />
                  <span className="truncate">Additional Details</span>
                </Label>
                <Textarea
                  id="additional_details"
                  name="additional_details"
                  value={formData.additional_details}
                  onChange={handleInputChange}
                  placeholder="Enter additional details"
                  rows={2}
                  className="border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 rounded-xl transition-all duration-200 resize-none text-xs sm:text-sm"
                />
              </div>

              {/* Suggested Keywords and HSN Descriptions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-5">
                <div className="space-y-1.5 sm:space-y-2">
                  <Label className="text-[10px] sm:text-xs md:text-sm font-medium text-gray-700 flex items-center gap-1.5 sm:gap-2">
                    <Tag className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 text-blue-500 flex-shrink-0" />
                    <span className="truncate">Suggested Keywords</span>
                  </Label>
                  <Input
                    id="suggested_keywords"
                    name="suggested_keywords"
                    value={formData.suggested_keywords}
                    onChange={handleInputChange}
                    placeholder="Enter suggested keywords"
                    className="border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 rounded-xl transition-all duration-200 h-9 sm:h-10 md:h-11 text-xs sm:text-sm"
                  />
                </div>
                <div className="space-y-1.5 sm:space-y-2">
                  <Label className="text-[10px] sm:text-xs md:text-sm font-medium text-gray-700 flex items-center gap-1.5 sm:gap-2">
                    <ClipboardList className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 text-blue-500 flex-shrink-0" />
                    <span className="truncate">HSN Descriptions</span>
                  </Label>
                  <Input
                    id="hsn_descriptions"
                    name="hsn_descriptions"
                    value={formData.hsn_descriptions}
                    onChange={handleInputChange}
                    placeholder="Enter HSN descriptions"
                    className="border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 rounded-xl transition-all duration-200 h-9 sm:h-10 md:h-11 text-xs sm:text-sm"
                  />
                </div>
              </div>

              {/* Confidence Level and Reason */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-5">
                <div className="space-y-1.5 sm:space-y-2">
                  <Label className="text-[10px] sm:text-xs md:text-sm font-medium text-gray-700 flex items-center gap-1.5 sm:gap-2">
                    <Target className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 text-blue-500 flex-shrink-0" />
                    <span className="truncate">Confidence Level</span>
                  </Label>
                  <Select
                    value={formData.confidence_level}
                    onValueChange={(value) => handleSelectChange('confidence_level', value)}
                  >
                    <SelectTrigger className="border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 rounded-xl transition-all duration-200 h-9 sm:h-10 md:h-11 text-xs sm:text-sm">
                      <SelectValue placeholder="Select confidence level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">
                        <span className="flex items-center gap-1.5 sm:gap-2">
                          <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-500" />
                          <span className="text-xs sm:text-sm">High</span>
                        </span>
                      </SelectItem>
                      <SelectItem value="medium">
                        <span className="flex items-center gap-1.5 sm:gap-2">
                          <AlertCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-500" />
                          <span className="text-xs sm:text-sm">Medium</span>
                        </span>
                      </SelectItem>
                      <SelectItem value="low">
                        <span className="flex items-center gap-1.5 sm:gap-2">
                          <AlertCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-500" />
                          <span className="text-xs sm:text-sm">Low</span>
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5 sm:space-y-2">
                  <Label className="text-[10px] sm:text-xs md:text-sm font-medium text-gray-700 flex items-center gap-1.5 sm:gap-2">
                    <FileText className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 text-blue-500 flex-shrink-0" />
                    <span className="truncate">Reason</span>
                  </Label>
                  <Input
                    id="reason"
                    name="reason"
                    value={formData.reason}
                    onChange={handleInputChange}
                    placeholder="Enter reason"
                    className="border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 rounded-xl transition-all duration-200 h-9 sm:h-10 md:h-11 text-xs sm:text-sm"
                  />
                </div>
              </div>

              {/* Classification Notes and Manual Verification */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-5">
                <div className="space-y-1.5 sm:space-y-2">
                  <Label className="text-[10px] sm:text-xs md:text-sm font-medium text-gray-700 flex items-center gap-1.5 sm:gap-2">
                    <Layers className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 text-blue-500 flex-shrink-0" />
                    <span className="truncate">Classification Notes</span>
                  </Label>
                  <Input
                    id="classification_notes"
                    name="classification_notes"
                    value={formData.classification_notes}
                    onChange={handleInputChange}
                    placeholder="Enter classification notes"
                    className="border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 rounded-xl transition-all duration-200 h-9 sm:h-10 md:h-11 text-xs sm:text-sm"
                  />
                </div>
                <div className="space-y-1.5 sm:space-y-2">
                  <Label className="text-[10px] sm:text-xs md:text-sm font-medium text-gray-700 flex items-center gap-1.5 sm:gap-2">
                    <Shield className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 text-blue-500 flex-shrink-0" />
                    <span className="truncate">Manual Verification</span>
                  </Label>
                  <Select
                    value={formData.manual_verification}
                    onValueChange={(value) => handleSelectChange('manual_verification', value)}
                  >
                    <SelectTrigger className="border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 rounded-xl transition-all duration-200 h-9 sm:h-10 md:h-11 text-xs sm:text-sm">
                      <SelectValue placeholder="Select verification" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Yes">
                        <span className="flex items-center gap-1.5 sm:gap-2">
                          <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-500" />
                          <span className="text-xs sm:text-sm">Yes</span>
                        </span>
                      </SelectItem>
                      <SelectItem value="No">
                        <span className="flex items-center gap-1.5 sm:gap-2">
                          <X className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-500" />
                          <span className="text-xs sm:text-sm">No</span>
                        </span>
                      </SelectItem>
                      <SelectItem value="Pending">
                        <span className="flex items-center gap-1.5 sm:gap-2">
                          <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-500" />
                          <span className="text-xs sm:text-sm">Pending</span>
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Contacts Section */}
              <div className="space-y-3 sm:space-y-4 pt-2">
                <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-2 xs:gap-0">
                  <Label className="text-sm sm:text-base font-semibold text-gray-800 flex items-center gap-1.5 sm:gap-2">
                    <Phone className="h-4 w-4 sm:h-4.5 sm:w-4.5 md:h-5 md:w-5 text-blue-500 flex-shrink-0" />
                    <span className="truncate text-[10px] sm:text-xs md:text-sm">Contact Numbers</span>
                    <span className="text-red-500 text-[10px] sm:text-xs">*</span>
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addContact}
                    className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 rounded-xl h-7 sm:h-8 md:h-9 text-[10px] sm:text-xs px-2 sm:px-3"
                  >
                    <Plus className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 sm:mr-2" />
                    Add Contact
                  </Button>
                </div>
                <div className="space-y-2">
                  {contacts.map((contact, index) => (
                    <div key={contact.id} className="flex items-center gap-1.5 sm:gap-2 group">
                      <div className="flex-1 min-w-0">
                        <Input
                          value={contact.contact_number}
                          onChange={(e) => updateContact(contact.id, e.target.value)}
                          placeholder={`Contact ${index + 1}`}
                          className="border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 rounded-xl transition-all duration-200 h-9 sm:h-10 md:h-11 text-xs sm:text-sm"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeContact(contact.id)}
                        className="text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors rounded-xl h-8 w-8 sm:h-9 sm:w-9 p-0"
                      >
                        <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Emails Section */}
              <div className="space-y-3 sm:space-y-4 pt-2">
                <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-2 xs:gap-0">
                  <Label className="text-sm sm:text-base font-semibold text-gray-800 flex items-center gap-1.5 sm:gap-2">
                    <Mail className="h-4 w-4 sm:h-4.5 sm:w-4.5 md:h-5 md:w-5 text-blue-500 flex-shrink-0" />
                    <span className="truncate text-[10px] sm:text-xs md:text-sm">Email Addresses</span>
                    <span className="text-red-500 text-[10px] sm:text-xs">*</span>
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addEmail}
                    className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 rounded-xl h-7 sm:h-8 md:h-9 text-[10px] sm:text-xs px-2 sm:px-3"
                  >
                    <Plus className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 sm:mr-2" />
                    Add Email
                  </Button>
                </div>
                <div className="space-y-2">
                  {emails.map((email, index) => (
                    <div key={email.id} className="flex items-center gap-1.5 sm:gap-2 group">
                      <div className="flex-1 min-w-0">
                        <Input
                          type="email"
                          value={email.email}
                          onChange={(e) => updateEmail(email.id, e.target.value)}
                          placeholder={`Email ${index + 1}`}
                          className="border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 rounded-xl transition-all duration-200 h-9 sm:h-10 md:h-11 text-xs sm:text-sm"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeEmail(email.id)}
                        className="text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors rounded-xl h-8 w-8 sm:h-9 sm:w-9 p-0"
                      >
                        <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 sm:pt-5 md:pt-6 mt-2 border-t border-gray-200">
                <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="h-10 sm:h-11 md:h-12 text-xs sm:text-sm md:text-base font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 sm:h-4.5 sm:w-4.5 md:h-5 md:w-5 mr-1.5 sm:mr-2 animate-spin" />
                        <span className="truncate">Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 sm:h-4.5 sm:w-4.5 md:h-5 md:w-5 mr-1.5 sm:mr-2 flex-shrink-0" />
                        <span className="truncate">Save Buyer</span>
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/buyers")}
                    disabled={loading}
                    className="h-10 sm:h-11 md:h-12 text-xs sm:text-sm md:text-base font-semibold rounded-xl border-2 hover:bg-gray-50 transition-all duration-200"
                  >
                    <span className="truncate">Cancel</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
};

export default AddBuyerPage;