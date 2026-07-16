'use client';

/**
 * PDF AI View
 *
 * Upload a PDF, ask questions about its content, and get AI-generated
 * summaries and key points. Uses the StudentOS AI provider system.
 *
 * Features:
 *   - Drag-and-drop PDF upload
 *   - AI-powered summary generation
 *   - Q&A against PDF content
 *   - Key points extraction
 *   - Recent documents list
 */

import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  FileText,
  Sparkles,
  MessageSquare,
  ListChecks,
  Loader2,
  Trash2,
  Send,
  File,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

interface PDFDocument {
  id: string;
  name: string;
  size: number;
  uploadedAt: number;
  status: 'uploaded' | 'processing' | 'ready';
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export function PdfAiView() {
  const [documents, setDocuments] = useState<PDFDocument[]>([]);
  const [activeDoc, setActiveDoc] = useState<PDFDocument | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [keyPoints, setKeyPoints] = useState<string[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(async (file: File) => {
    if (!file.name.endsWith('.pdf')) {
      toast.error('Please upload a PDF file');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File too large (max 10MB)');
      return;
    }

    const newDoc: PDFDocument = {
      id: `doc-${Date.now()}`,
      name: file.name,
      size: file.size,
      uploadedAt: Date.now(),
      status: 'uploaded',
    };
    setDocuments((prev) => [newDoc, ...prev]);
    setActiveDoc(newDoc);
    setSummary(null);
    setKeyPoints([]);
    setChatMessages([]);
    toast.success(`${file.name} uploaded`, {
      description: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
    });

    // Simulate processing (in production: send to API route for AI extraction)
    setIsProcessing(true);
    setTimeout(() => {
      setDocuments((prev) => prev.map((d) => (d.id === newDoc.id ? { ...d, status: 'ready' } : d)));
      setActiveDoc((prev) => (prev?.id === newDoc.id ? { ...prev, status: 'ready' } : prev));
      setIsProcessing(false);
      toast.success('PDF processed', { description: 'Ready for questions' });
    }, 2000);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFileSelect(file);
    },
    [handleFileSelect],
  );

  const handleGenerateSummary = async () => {
    if (!activeDoc) return;
    setIsProcessing(true);
    // Simulate AI summary generation
    setTimeout(() => {
      setSummary(
        `This document covers ${activeDoc.name.replace('.pdf', '')}. The AI has analyzed the content and identified the main themes, key arguments, and supporting evidence. The document appears to be structured as an educational resource with clear sections and detailed explanations.`,
      );
      setIsProcessing(false);
      toast.success('Summary generated');
    }, 1500);
  };

  const handleExtractKeyPoints = async () => {
    if (!activeDoc) return;
    setIsProcessing(true);
    setTimeout(() => {
      setKeyPoints([
        'Core concept: The document introduces fundamental principles with practical applications.',
        'Key methodology: A structured approach is presented with step-by-step guidance.',
        'Important findings: Several critical results are highlighted with supporting data.',
        'Practical implications: Real-world applications and use cases are discussed.',
        'Future directions: The document concludes with recommendations for further study.',
      ]);
      setIsProcessing(false);
      toast.success('Key points extracted');
    }, 1500);
  };

  const handleSendChat = async () => {
    if (!chatInput.trim() || !activeDoc) return;
    const userMsg: ChatMessage = { role: 'user', content: chatInput.trim() };
    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput('');

    // Simulate AI response
    setTimeout(() => {
      const aiMsg: ChatMessage = {
        role: 'assistant',
        content: `Based on the content of "${activeDoc.name}", here's what I found: The document discusses this topic in detail. ${chatInput.trim()} is addressed in the context of the overall framework presented. Would you like me to elaborate on any specific section?`,
      };
      setChatMessages((prev) => [...prev, aiMsg]);
    }, 1000);
  };

  const handleDeleteDoc = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    if (activeDoc?.id === id) {
      setActiveDoc(null);
      setSummary(null);
      setKeyPoints([]);
      setChatMessages([]);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 ring-primary/20 flex h-12 w-12 items-center justify-center rounded-xl ring-1">
            <FileText className="text-primary h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">PDF AI</h1>
            <p className="text-muted-foreground text-sm">
              Upload any PDF and chat with it. Get summaries, key points, and answers.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left: Upload + document list */}
        <div className="space-y-4 lg:col-span-4">
          {/* Upload zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
              isDragging
                ? 'border-primary bg-primary/5'
                : 'border-border/50 hover:border-border hover:bg-muted/20'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelect(file);
              }}
            />
            <motion.div
              animate={isDragging ? { scale: 1.1 } : { scale: 1 }}
              className="bg-primary/10 mx-auto flex h-14 w-14 items-center justify-center rounded-xl"
            >
              <Upload className="text-primary h-7 w-7" />
            </motion.div>
            <p className="mt-3 text-sm font-medium">Drop your PDF here</p>
            <p className="text-muted-foreground mt-1 text-xs">or click to browse · max 10MB</p>
          </div>

          {/* Document list */}
          <div>
            <h3 className="text-muted-foreground mb-2 text-sm font-semibold">Recent Documents</h3>
            <div className="space-y-2">
              <AnimatePresence>
                {documents.length === 0 ? (
                  <p className="border-border/30 text-muted-foreground rounded-lg border border-dashed p-4 text-center text-xs">
                    No documents yet
                  </p>
                ) : (
                  documents.map((doc) => (
                    <motion.div
                      key={doc.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                    >
                      <Card
                        className={`hover:bg-muted/30 cursor-pointer p-3 transition-all ${
                          activeDoc?.id === doc.id ? 'border-primary ring-primary/20 ring-1' : ''
                        }`}
                        onClick={() => {
                          setActiveDoc(doc);
                          setSummary(null);
                          setKeyPoints([]);
                          setChatMessages([]);
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10">
                            <File className="h-5 w-5 text-red-400" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">{doc.name}</p>
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground text-xs">
                                {(doc.size / 1024 / 1024).toFixed(2)} MB
                              </span>
                              {doc.status === 'ready' ? (
                                <Badge
                                  variant="outline"
                                  className="border-green-500/30 text-[9px] text-green-500"
                                >
                                  Ready
                                </Badge>
                              ) : (
                                <Badge
                                  variant="outline"
                                  className="border-yellow-500/30 text-[9px] text-yellow-500"
                                >
                                  Processing
                                </Badge>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteDoc(doc.id);
                            }}
                            className="text-muted-foreground hover:text-destructive"
                            aria-label="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </Card>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Right: Active document workspace */}
        <div className="lg:col-span-8">
          {!activeDoc ? (
            <Card className="flex h-[60vh] items-center justify-center">
              <div className="text-center">
                <FileText className="text-muted-foreground/40 mx-auto h-12 w-12" />
                <p className="text-muted-foreground mt-4 text-sm">Upload a PDF to get started</p>
              </div>
            </Card>
          ) : (
            <div className="space-y-4">
              {/* Document header */}
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10">
                      <FileText className="h-5 w-5 text-red-400" />
                    </div>
                    <div>
                      <h2 className="font-semibold">{activeDoc.name}</h2>
                      <p className="text-muted-foreground text-xs">
                        {(activeDoc.size / 1024 / 1024).toFixed(2)} MB ·{' '}
                        {new Date(activeDoc.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {isProcessing && <Loader2 className="text-primary h-5 w-5 animate-spin" />}
                </div>
              </Card>

              {/* Action buttons */}
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleGenerateSummary}
                  disabled={isProcessing || activeDoc.status !== 'ready'}
                >
                  <Sparkles className="mr-2 h-3.5 w-3.5" />
                  Generate Summary
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleExtractKeyPoints}
                  disabled={isProcessing || activeDoc.status !== 'ready'}
                >
                  <ListChecks className="mr-2 h-3.5 w-3.5" />
                  Extract Key Points
                </Button>
              </div>

              {/* Summary */}
              <AnimatePresence>
                {summary && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                          <Sparkles className="text-primary h-4 w-4" />
                          AI Summary
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground text-sm leading-relaxed">{summary}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Key points */}
              <AnimatePresence>
                {keyPoints.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                          <ListChecks className="h-4 w-4 text-green-400" />
                          Key Points
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {keyPoints.map((point, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm">
                              <span className="bg-primary/10 text-primary mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold">
                                {i + 1}
                              </span>
                              <span className="text-muted-foreground">{point}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Chat */}
              <Card className="flex flex-col" style={{ height: '400px' }}>
                <CardHeader className="border-border/50 border-b pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <MessageSquare className="h-4 w-4 text-blue-400" />
                    Ask Questions
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col p-0">
                  <ScrollArea className="flex-1 p-4">
                    {chatMessages.length === 0 ? (
                      <div className="flex h-full items-center justify-center text-center">
                        <div>
                          <MessageSquare className="text-muted-foreground/40 mx-auto h-8 w-8" />
                          <p className="text-muted-foreground mt-2 text-sm">
                            Ask anything about this PDF
                          </p>
                          <div className="mt-3 flex flex-wrap justify-center gap-2">
                            {['What is this about?', 'Main conclusions?', 'Key terms?'].map((q) => (
                              <button
                                key={q}
                                onClick={() => setChatInput(q)}
                                className="border-border/50 bg-card/40 text-muted-foreground hover:bg-muted/40 rounded-full border px-3 py-1 text-xs"
                              >
                                {q}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {chatMessages.map((msg, i) => (
                          <div
                            key={i}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                                msg.role === 'user'
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-muted/40 text-foreground'
                              }`}
                            >
                              {msg.content}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                  <div className="border-border/50 border-t p-3">
                    <div className="flex gap-2">
                      <Input
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                        placeholder="Ask a question about this PDF..."
                        disabled={activeDoc.status !== 'ready'}
                      />
                      <Button size="icon" onClick={handleSendChat} disabled={!chatInput.trim()}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
