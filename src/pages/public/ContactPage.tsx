/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { PhoneNumber, EmailAddress, ContactInfo } from '../../types.js';
import { CheckCircle2, Clock, Mail, MapPin, MessageCircle, Phone, Send } from 'lucide-react';
import { publicApi } from '../../lib/api.js';

interface ContactPageProps {
  contactInfo: ContactInfo;
  phoneNumbers: PhoneNumber[];
  emailAddresses: EmailAddress[];
}

export const ContactPage: React.FC<ContactPageProps> = ({
  contactInfo,
  phoneNumbers,
  emailAddresses,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('Admission Inquiry');
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const publicPhones = phoneNumbers.filter((p) => p.isPublic);
  const publicEmails = emailAddresses.filter((e) => e.isPublic);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !message) return;

    setIsLoading(true);
    try {
      await publicApi.submitInquiry({
        name,
        phone,
        email,
        subject,
        message,
      });
      setIsSubmitted(true);
    } catch (err) {
      console.error(err);
      alert('Error submitting message. Please call our direct helpline.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full bg-slate-50 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 space-y-10">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-blue-900 text-white rounded-2xl p-8 sm:p-10 shadow-md">
          <div className="max-w-3xl space-y-2">
            <span className="bg-orange-600 text-white text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
              Get in Touch
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Contact &amp; Admissions Directorate
            </h1>
            <p className="text-slate-300 text-sm leading-relaxed">
              Have questions about DAE admissions, syllabus criteria, fee structures, or campus visits? Reach out to our admissions team.
            </p>
          </div>
        </div>

        {/* 3-Column Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Verified Phone Numbers */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
              <Phone className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-blue-950">Official Phone Numbers</h3>
            <p className="text-xs text-slate-500">Call during regular administrative hours:</p>
            <div className="space-y-2 pt-2 text-xs">
              {publicPhones.map((ph) => (
                <div key={ph.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-slate-400 block text-[10px] font-bold uppercase">{ph.title}</span>
                    <strong className="text-slate-900 text-sm">{ph.number}</strong>
                  </div>
                  {ph.isWhatsApp && (
                    <a
                      href={`https://wa.me/${ph.number.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-lg transition-colors"
                      title="Direct WhatsApp"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Card 2: Official Emails */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <Mail className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-blue-950">Official Email Addresses</h3>
            <p className="text-xs text-slate-500">Send inquiries and verification documents:</p>
            <div className="space-y-2 pt-2 text-xs">
              {publicEmails.map((em) => (
                <div key={em.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">{em.title}</span>
                  <strong className="text-slate-900 text-xs">{em.email}</strong>
                </div>
              ))}
            </div>
          </div>

          {/* Card 3: Location & Hours */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-blue-950">Campus Location</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{contactInfo.address}</p>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center gap-2 text-xs text-slate-700">
              <Clock className="w-4 h-4 text-orange-500 shrink-0" />
              <span>{contactInfo.officeHours || 'Mon - Sat: 8:00 AM - 3:00 PM'}</span>
            </div>
          </div>
        </div>

        {/* Map & Inquiry Form */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Inquiry Form */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-blue-950 mb-1">Send a Direct Inquiry</h3>
            <p className="text-xs text-slate-500 mb-6">
              Our Admissions and Student Affairs Officer will get back to you promptly.
            </p>

            {isSubmitted ? (
              <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-emerald-900 text-sm">Message Received!</h4>
                <p className="text-xs text-emerald-700">Thank you. We will contact you shortly.</p>
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="text-xs font-bold text-emerald-800 underline mt-2"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Tariq Mehmood"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Mobile / WhatsApp *</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0300-1234567"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Email (Optional)</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Subject</label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none bg-white"
                  >
                    <option value="Admission Inquiry">DAE Admissions &amp; Eligibility</option>
                    <option value="Fee Structure & Scholarships">Fee Structure &amp; Scholarships</option>
                    <option value="Result Verification Issue">Result Verification Issue</option>
                    <option value="Campus Visit & Workshop Tour">Campus Visit &amp; Workshop Tour</option>
                    <option value="General Information">General Inquiry</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Your Message *</label>
                  <textarea
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Write your question or request..."
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg text-xs transition-all shadow flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{isLoading ? 'Sending...' : 'Submit Message'}</span>
                </button>
              </form>
            )}
          </div>

          {/* Interactive Location Map Box */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 flex flex-col justify-between space-y-4">
            <div>
              <h3 className="text-lg font-bold text-blue-950 mb-1">Campus Location Map</h3>
              <p className="text-xs text-slate-500">Visit our campus on College Road, Faisalabad.</p>
            </div>

            <div className="w-full h-80 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 relative">
              <iframe
                title="Campus Map"
                src={
                  contactInfo.googleMapEmbedUrl ||
                  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d108960.98501252033!2d73.01358995393527!3d31.41871477740284!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x392242a895a55ca9%3A0xdec58f88932671c6!2sFaisalabad%2C%20Punjab%2C%20Pakistan!5e0!3m2!1sen!2s!4v1650000000000!5m2!1sen!2s'
                }
                className="w-full h-full border-0"
                loading="lazy"
              ></iframe>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-900 flex items-center justify-between">
              <span>Open for visitor campus tours Mon-Sat: 9:00 AM - 2:00 PM</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
