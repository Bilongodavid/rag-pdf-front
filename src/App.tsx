import { useState, useRef } from "react";
import { Send, Menu, X, Plus, Trash2, FileText } from "lucide-react";
import ChatMessages from "./components/chat-messages";
import PDFUploadArea from "./components/pdf-upload-area";
import "./App.css";
import { Toaster } from "react-hot-toast";
interface Conversation {
  id: string;
  title: string;
  uploadedFile: File | null;
  messages: Array<{ id: string; text: string; sender: "user" | "bot" }>;
}

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: "1",
      title: "Nouvelle discussion",
      uploadedFile: null,
      messages: [
        {
          id: "1",
          text: "Bonjour ! Je suis votre assistant IA. Téléchargez un PDF pour commencer à recevoir des questions sur son contenu.",
          sender: "bot",
        },
      ],
    },
  ]);
  const [currentConversationId, setCurrentConversationId] = useState("1");
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentConversation = conversations.find(
    (c) => c.id === currentConversationId
  );

  const handlePDFUpload = (file: File) => {
    setConversations((prev) =>
      prev.map((c) =>
        c.id === currentConversationId
          ? {
              ...c,
              uploadedFile: file,
              title: file.name.slice(0, 20),
              messages: [
                ...c.messages,
                {
                  id: Date.now().toString(),
                  text: `PDF uploaded: ${file.name}`,
                  sender: "bot",
                },
              ],
            }
          : c
      )
    );
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      text: inputValue,
      sender: "user" as const,
    };
    setConversations((prev) =>
      prev.map((c) =>
        c.id === currentConversationId
          ? { ...c, messages: [...c.messages, userMessage] }
          : c
      )
    );
    setInputValue("");
    setIsLoading(true);

    try {
      if (currentConversation?.uploadedFile) {
        const formData = new FormData();
        formData.append("ask", inputValue);
        formData.append("file", currentConversation.uploadedFile);

        const response = await fetch("http://localhost:3000/rag", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) throw new Error("API request failed");

        const data = await response.json();
        console.log("[v0] API Response:", data);

        const botMessage = {
          id: (Date.now() + 1).toString(),
          text: data.davIa || "Unable to process your request",
          sender: "bot" as const,
        };
        setConversations((prev) =>
          prev.map((c) =>
            c.id === currentConversationId
              ? { ...c, messages: [...c.messages, botMessage] }
              : c
          )
        );
      } else {
        // Fallback response when no PDF is uploaded
        const botMessage = {
          id: (Date.now() + 1).toString(),
          text: "Please upload a PDF first to ask questions about its content.",
          sender: "bot" as const,
        };
        setConversations((prev) =>
          prev.map((c) =>
            c.id === currentConversationId
              ? { ...c, messages: [...c.messages, botMessage] }
              : c
          )
        );
      }
    } catch (error) {
      console.log("[v0] Error:", error);
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, there was an error processing your request. Please try again.",
        sender: "bot" as const,
      };
      setConversations((prev) =>
        prev.map((c) =>
          c.id === currentConversationId
            ? { ...c, messages: [...c.messages, errorMessage] }
            : c
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const createNewConversation = () => {
    const newId = Date.now().toString();
    setConversations((prev) => [
      ...prev,
      {
        id: newId,
        title: "Nouvelle discussion",
        uploadedFile: null,
        messages: [
          {
            id: "1",
            text: "Bonjour ! Je suis votre assistant IA. Téléchargez un PDF pour commencer à recevoir des questions sur son contenu.",
            sender: "bot",
          },
        ],
      },
    ]);
    setCurrentConversationId(newId);
  };

  const deleteConversation = (id: string) => {
    const filtered = conversations.filter((c) => c.id !== id);
    if (filtered.length > 0) {
      setConversations(filtered);
      setCurrentConversationId(filtered[0].id);
    }
  };

  const handleRemoveFile = () => {
    setConversations((prev) =>
      prev.map((c) =>
        c.id === currentConversationId ? { ...c, uploadedFile: null } : c
      )
    );
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-64" : "w-0"
        } bg-gray-100 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 overflow-hidden flex flex-col`}
      >
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={createNewConversation}
            className="w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nouvelle discussion
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => setCurrentConversationId(conv.id)}
              className={`p-3 rounded-lg cursor-pointer transition-colors ${
                currentConversationId === conv.id
                  ? "bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-white"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              <p className="text-sm font-medium truncate">{conv.title}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {conv.messages.length} messages
              </p>
            </div>
          ))}
        </div>

        <div className="p-3 border-t border-gray-200 dark:border-gray-700 space-y-2">
          {currentConversation && conversations.length > 1 && (
            <button
              onClick={() => deleteConversation(currentConversationId)}
              className="w-full text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen">
        <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
            PDF Assistant
          </h1>
          <div className="w-10" />
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col overflow-hidden pb-40">
          {/* Messages */}
          <ChatMessages
            messages={currentConversation?.messages || []}
            ref={messagesEndRef}
            isLoading={isLoading}
          />
        </div>

        <div
          className="fixed bottom-0 right-0 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 space-y-2"
          style={{ width: sidebarOpen ? "calc(100% - 16rem)" : "100%" }}
        >
          {!currentConversation?.uploadedFile ? (
            <div className="max-w-2xl mx-auto w-full">
              <PDFUploadArea onUpload={handlePDFUpload} />
            </div>
          ) : (
            <div className="max-w-2xl mx-auto w-full flex items-center gap-3 px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {currentConversation.uploadedFile.name}
                </p>
              </div>
              <button
                onClick={handleRemoveFile}
                className="text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="max-w-2xl mx-auto w-full flex gap-3">
            <input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder={
                currentConversation?.uploadedFile
                  ? "Posez une question à propos de votre PDF..."
                  : "Téléchargez un PDF pour commencer"
              }
              disabled={isLoading}
              className="flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-lg px-4 py-2 disabled:opacity-50"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg px-4 py-2 transition-colors flex items-center justify-center"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      <Toaster position="bottom-right" reverseOrder={false} />
    </div>
  );
}
