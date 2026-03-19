import { useState } from "react";
import { Share2, Copy, Twitter, Facebook, Link2, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ShareButton({ 
  designImage, 
  title = "Check out my upcycled design!",
  description = "I just created this amazing upcycled fashion piece using Second Stitch AI!"
}) {
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sharing, setSharing] = useState(false);

  const shareText = `${title}\n${description}\n#SecondStitch #Upcycling #SustainableFashion`;

  const shareUrls = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?quote=${encodeURIComponent(shareText)}`
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Second Stitch - Upcycled Design",
          text: shareText,
          url: window.location.href
        });
      } catch (err) {
        if (err.name !== "AbortError") {
          setShowModal(true);
        }
      }
    } else {
      setShowModal(true);
    }
  };

  const handleNativeShare = async (platform) => {
    setSharing(true);
    
    if (platform === "twitter") {
      window.open(shareUrls.twitter, "_blank", "width=550,height=420");
    } else if (platform === "facebook") {
      window.open(shareUrls.facebook, "_blank", "width=550,height=420");
    } else if (platform === "download") {
      // Trigger download
      if (designImage) {
        const link = document.createElement("a");
        link.href = designImage;
        link.download = "upcycled-design.png";
        link.click();
      }
    }
    
    setTimeout(() => setSharing(false), 1000);
  };

  return (
    <>
      <button
        onClick={handleShare}
        className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold text-sm shadow-lg hover:shadow-xl hover:brightness-110 active:scale-95 transition-all"
      >
        <Share2 className="w-4 h-4" />
        Share
      </button>

      <AnimatePresence>
        {showModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="fixed inset-0 bg-black/50 z-50"
            />
            
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-rose-800">Share Your Design</h3>
                  <button 
                    onClick={() => setShowModal(false)}
                    className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 hover:bg-rose-200"
                  >
                    ✕
                  </button>
                </div>

                {/* Share Preview */}
                <div className="bg-rose-50 rounded-2xl p-4 mb-6">
                  <p className="text-rose-800 font-medium text-sm">{title}</p>
                  <p className="text-rose-600 text-xs mt-1">{description}</p>
                </div>

                {/* Share Options */}
                <div className="grid grid-cols-4 gap-3 mb-6">
                  <button
                    onClick={() => handleNativeShare("twitter")}
                    disabled={sharing}
                    className="flex flex-col items-center gap-2 p-3 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                      <Twitter className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xs font-medium text-blue-700">Twitter</span>
                  </button>

                  <button
                    onClick={() => handleNativeShare("facebook")}
                    disabled={sharing}
                    className="flex flex-col items-center gap-2 p-3 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-blue-700 flex items-center justify-center">
                      <Facebook className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xs font-medium text-blue-700">Facebook</span>
                  </button>

                  <button
                    onClick={handleCopyLink}
                    className="flex flex-col items-center gap-2 p-3 rounded-xl bg-rose-50 hover:bg-rose-100 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-rose-500 flex items-center justify-center">
                      {copied ? <Check className="w-5 h-5 text-white" /> : <Copy className="w-5 h-5 text-white" />}
                    </div>
                    <span className="text-xs font-medium text-rose-700">{copied ? "Copied!" : "Copy"}</span>
                  </button>

                  <button
                    onClick={() => handleNativeShare("download")}
                    disabled={sharing}
                    className="flex flex-col items-center gap-2 p-3 rounded-xl bg-green-50 hover:bg-green-100 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                      <Link2 className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xs font-medium text-green-700">Save</span>
                  </button>
                </div>

                {/* Share Link Input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={typeof window !== 'undefined' ? window.location.href : ''}
                    className="flex-1 px-4 py-2 rounded-xl bg-gray-100 text-gray-600 text-sm border-0"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="px-4 py-2 rounded-xl bg-rose-600 text-white font-medium text-sm hover:bg-rose-700"
                  >
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
