// import { Button } from '@/components/ui/button';
// import { X } from 'lucide-react';
// import { useNavigate } from 'react-router-dom';

// export default function EmailConfigModal({
//   open,
//   message,
//   onClose,
// }: {
//   open: boolean;
//   message: string;
//   onClose: () => void;
// }) {
//   const navigate = useNavigate();
//   if (!open) return null;

//   return (
//     <div 
//       className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-4" 
//       onClick={onClose}
//     >
//       <div 
//         className="bg-background border rounded-xl shadow-2xl w-full max-w-sm mx-2 sm:mx-4 p-4 sm:p-6" 
//         onClick={(e) => e.stopPropagation()}
//       >
//         <div className="flex justify-between items-center mb-3 sm:mb-4">
//           <h2 className="text-base sm:text-lg font-semibold">Email Setup Required</h2>
//           <button 
//             onClick={onClose}
//             className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
//           >
//             <X className="h-4 w-4 sm:h-5 sm:w-5" />
//           </button>
//         </div>
        
//         <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 leading-relaxed">
//           {message}
//         </p>
        
//         <div className="flex flex-row justify-end gap-2 sm:gap-3">
//           <Button 
//             variant="outline" 
//             size="sm" 
//             onClick={onClose}
//             className="flex-1 sm:flex-none text-xs sm:text-sm px-2 sm:px-4"
//           >
//             Cancel
//           </Button>
//           <Button 
//             size="sm" 
//             onClick={() => navigate('/emailconfig')}
//             className="flex-1 sm:flex-none text-xs sm:text-sm px-2 sm:px-4 bg-blue-600 hover:bg-blue-700 text-white"
//           >
//             Go to Config
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// }




// import { Button } from "@/components/ui/button";
// import { X, Mail, Settings2, ArrowRight } from "lucide-react";
// import { useNavigate } from "react-router-dom";

// export default function EmailConfigModal({
//   open,
//   message,
//   onClose,
// }: {
//   open: boolean;
//   message: string;
//   onClose: () => void;
// }) {
//   const navigate = useNavigate();

//   if (!open) return null;

//   const handleConfig = () => {
//     onClose();
//     navigate("/emailconfig");
//   };

//   return (
//     <div
//       className="
//         fixed inset-0 z-[9999]
//         flex items-center justify-center
//         bg-slate-950/60
//         backdrop-blur-sm
//         p-4
//         animate-in fade-in duration-200
//       "
//       onClick={onClose}
//     >
//       <div
//         className="
//           relative
//           w-full max-w-md
//           overflow-hidden
//           rounded-2xl
//           border border-white/20
//           bg-background
//           shadow-[0_25px_80px_rgba(0,0,0,0.25)]
//           animate-in
//           zoom-in-95
//           slide-in-from-bottom-3
//           duration-300
//         "
//         onClick={(e) => e.stopPropagation()}
//       >
//         {/* Top Gradient */}
//         <div
//           className="
//             absolute inset-x-0 top-0
//             h-1
//             bg-gradient-to-r
//             from-blue-500
//             via-indigo-500
//             to-purple-500
//           "
//         />

//         {/* Close Button */}
//         <button
//           onClick={onClose}
//           aria-label="Close"
//           className="
//             absolute right-4 top-4
//             flex h-8 w-8
//             items-center justify-center
//             rounded-full
//             text-muted-foreground
//             transition-all duration-200
//             hover:bg-muted
//             hover:text-foreground
//             hover:rotate-90
//           "
//         >
//           <X className="h-4 w-4" />
//         </button>

//         <div className="p-6 sm:p-7">
//           {/* Icon */}
//           <div className="mb-5 flex items-center justify-center">
//             <div
//               className="
//                 relative
//                 flex h-16 w-16
//                 items-center justify-center
//                 rounded-2xl
//                 bg-gradient-to-br
//                 from-blue-500
//                 to-indigo-600
//                 shadow-lg
//                 shadow-blue-500/25
//               "
//             >
//               {/* Glow */}
//               <div
//                 className="
//                   absolute inset-0
//                   rounded-2xl
//                   bg-blue-500/20
//                   blur-xl
//                 "
//               />

//               <Mail
//                 className="
//                   relative z-10
//                   h-7 w-7
//                   text-white
//                 "
//               />

//               {/* Small Settings Badge */}
//               <div
//                 className="
//                   absolute -right-2 -bottom-2
//                   flex h-7 w-7
//                   items-center justify-center
//                   rounded-full
//                   border-4 border-background
//                   bg-white
//                   shadow-md
//                 "
//               >
//                 <Settings2 className="h-3.5 w-3.5 text-blue-600" />
//               </div>
//             </div>
//           </div>

//           {/* Heading */}
//           <div className="text-center">
//             <h2
//               className="
//                 text-xl sm:text-2xl
//                 font-bold
//                 tracking-tight
//                 text-foreground
//               "
//             >
//               Email Setup Required
//             </h2>

//             <p
//               className="
//                 mt-2
//                 text-sm
//                 leading-6
//                 text-muted-foreground
//               "
//             >
//               Your email settings need to be configured before you can
//               continue.
//             </p>
//           </div>

//           {/* Message Box */}
//           <div
//             className="
//               mt-5
//               rounded-xl
//               border border-blue-100
//               bg-blue-50/70
//               p-4
//               dark:border-blue-900/50
//               dark:bg-blue-950/30
//             "
//           >
//             <div className="flex gap-3">
//               <div
//                 className="
//                   mt-0.5
//                   flex h-7 w-7 shrink-0
//                   items-center justify-center
//                   rounded-lg
//                   bg-blue-100
//                   dark:bg-blue-900/60
//                 "
//               >
//                 <Mail className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
//               </div>

//               <p
//                 className="
//                   text-sm
//                   leading-6
//                   text-blue-900
//                   dark:text-blue-100
//                 "
//               >
//                 {message}
//               </p>
//             </div>
//           </div>

//           {/* Actions */}
//           <div className="mt-6 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
//             <Button
//               variant="outline"
//               onClick={onClose}
//               className="
//                 h-11
//                 rounded-xl
//                 border-border
//                 px-5
//                 transition-all
//                 hover:bg-muted
//               "
//             >
//               Cancel
//             </Button>

//             <Button
//               onClick={handleConfig}
//               className="
//                 group
//                 h-11
//                 rounded-xl
//                 bg-gradient-to-r
//                 from-blue-600
//                 to-indigo-600
//                 px-5
//                 text-white
//                 shadow-lg
//                 shadow-blue-500/20
//                 transition-all
//                 duration-200
//                 hover:-translate-y-0.5
//                 hover:from-blue-700
//                 hover:to-indigo-700
//                 hover:shadow-xl
//               "
//             >
//               <Settings2 className="mr-2 h-4 w-4" />

//               Go to Config

//               <ArrowRight
//                 className="
//                   ml-2
//                   h-4 w-4
//                   transition-transform
//                   duration-200
//                   group-hover:translate-x-1
//                 "
//               />
//             </Button>
//           </div>

          
//         </div>
//       </div>
//     </div>
//   );
// }




// import { Button } from "@/components/ui/button";
// import { X, Mail, Settings2, ArrowRight } from "lucide-react";
// import { useNavigate } from "react-router-dom";

// export default function EmailConfigModal({
//   open,
//   message,
//   onClose,
// }: {
//   open: boolean;
//   message: string;
//   onClose: () => void;
// }) {
//   const navigate = useNavigate();

//   if (!open) return null;

//   const handleConfig = () => {
//     onClose();
//     navigate("/emailconfig");
//   };

//   return (
//     <div
//       className="
//         fixed inset-0 z-[9999]
//         flex items-center justify-center
//         bg-slate-950/60
//         backdrop-blur-sm
//         p-4
//         animate-in fade-in duration-200
//       "
//       onClick={onClose}
//     >
//       <div
//         className="
//           relative
//           w-full max-w-md
//           overflow-hidden
//           rounded-2xl
//           border border-white/10
//           bg-gradient-to-br from-background via-background to-blue-50/10
//           shadow-[0_25px_80px_rgba(0,0,0,0.3)]
//           animate-in
//           zoom-in-95
//           slide-in-from-bottom-3
//           duration-300
//         "
//         onClick={(e) => e.stopPropagation()}
//       >
//         {/* Decorative Background Glow */}
//         <div
//           className="
//             absolute -top-24 -right-24
//             h-64 w-64
//             rounded-full
//             bg-blue-500/10
//             blur-3xl
//           "
//         />
//         <div
//           className="
//             absolute -bottom-24 -left-24
//             h-64 w-64
//             rounded-full
//             bg-purple-500/10
//             blur-3xl
//           "
//         />

//         {/* Close Button */}
//         <button
//           onClick={onClose}
//           aria-label="Close"
//           className="
//             absolute right-4 top-4
//             flex h-9 w-9
//             items-center justify-center
//             rounded-full
//             bg-background/80
//             text-muted-foreground
//             transition-all duration-300
//             hover:bg-blue-50
//             hover:text-blue-600
//             hover:rotate-90
//             hover:scale-110
//             backdrop-blur-sm
//             border border-border/50
//           "
//         >
//           <X className="h-4.5 w-4.5" />
//         </button>

//         <div className="p-7 sm:p-8">
//           {/* Icon Section */}
//           <div className="mb-6 flex items-center justify-center">
//             <div className="relative">
//               {/* Pulsing Glow */}
//               <div
//                 className="
//                   absolute inset-0
//                   rounded-2xl
//                   bg-blue-500/20
//                   blur-2xl
//                   animate-pulse
//                 "
//               />
              
//               {/* Main Icon Container */}
//               <div
//                 className="
//                   relative
//                   flex h-20 w-20
//                   items-center justify-center
//                   rounded-2xl
//                   bg-gradient-to-br
//                   from-blue-500
//                   via-blue-600
//                   to-indigo-600
//                   shadow-lg
//                   shadow-blue-500/30
//                   transition-transform
//                   duration-300
//                   hover:scale-105
//                 "
//               >
//                 <Mail
//                   className="
//                     relative z-10
//                     h-8 w-8
//                     text-white
//                   "
//                 />

//                 {/* Settings Badge */}
//                 <div
//                   className="
//                     absolute -right-2 -bottom-2
//                     flex h-8 w-8
//                     items-center justify-center
//                     rounded-full
//                     border-4 border-background
//                     bg-gradient-to-br from-white to-gray-50
//                     shadow-md
//                     animate-bounce
//                     [animation-duration:2s]
//                   "
//                 >
//                   <Settings2 className="h-4 w-4 text-blue-600" />
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Content */}
//           <div className="text-center">
//             <h2
//               className="
//                 text-2xl sm:text-3xl
//                 font-bold
//                 tracking-tight
//                 bg-gradient-to-r
//                 from-blue-600
//                 via-indigo-600
//                 to-purple-600
//                 bg-clip-text
//                 text-transparent
//               "
//             >
//               Email Setup Required
//             </h2>

//             <p
//               className="
//                 mt-2.5
//                 text-sm
//                 leading-6
//                 text-muted-foreground
//                 max-w-xs
//                 mx-auto
//               "
//             >
//               Your email settings need to be configured before you can
//               continue.
//             </p>
//           </div>

//           {/* Message Card */}
//           <div
//             className="
//               mt-6
//               rounded-xl
//               border border-blue-200/50
//               bg-gradient-to-br
//               from-blue-50/80
//               to-indigo-50/60
//               p-4
//               dark:from-blue-950/30
//               dark:to-indigo-950/20
//               dark:border-blue-900/30
//               backdrop-blur-sm
//               shadow-inner
//             "
//           >
//             <div className="flex gap-3 items-start">
//               <div
//                 className="
//                   mt-0.5
//                   flex h-8 w-8 shrink-0
//                   items-center justify-center
//                   rounded-lg
//                   bg-blue-500/10
//                   dark:bg-blue-500/20
//                 "
//               >
//                 <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
//               </div>

//               <p
//                 className="
//                   text-sm
//                   leading-6
//                   text-blue-900
//                   dark:text-blue-100
//                   font-medium
//                 "
//               >
//                 {message}
//               </p>
//             </div>
//           </div>

//           {/* Actions */}
//           <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
//             <Button
//               variant="outline"
//               onClick={onClose}
//               className="
//                 h-11
//                 rounded-xl
//                 border-2
//                 border-border/60
//                 px-6
//                 font-medium
//                 transition-all
//                 duration-300
//                 hover:bg-blue-50
//                 hover:border-blue-200
//                 hover:scale-[1.02]
//               "
//             >
//               Cancel
//             </Button>

//             <Button
//               onClick={handleConfig}
//               className="
//                 group
//                 relative
//                 h-11
//                 rounded-xl
//                 bg-gradient-to-r
//                 from-blue-600
//                 via-indigo-600
//                 to-purple-600
//                 px-6
//                 text-white
//                 font-medium
//                 shadow-lg
//                 shadow-blue-500/25
//                 transition-all
//                 duration-300
//                 hover:-translate-y-0.5
//                 hover:shadow-xl
//                 hover:shadow-blue-500/35
//                 active:scale-95
//                 overflow-hidden
//               "
//             >
//               {/* Button Shine Effect */}
//               <div
//                 className="
//                   absolute inset-0
//                   bg-gradient-to-r
//                   from-transparent
//                   via-white/20
//                   to-transparent
//                   -translate-x-full
//                   group-hover:translate-x-full
//                   transition-transform
//                   duration-700
//                 "
//               />

//               <Settings2 className="mr-2 h-4 w-4" />
//               Go to Config
//               <ArrowRight
//                 className="
//                   ml-2
//                   h-4 w-4
//                   transition-transform
//                   duration-300
//                   group-hover:translate-x-1.5
//                 "
//               />
//             </Button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }



import { Button } from "@/components/ui/button";
import { X, Mail, Settings2, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function EmailConfigModal({
  open,
  message,
  onClose,
}: {
  open: boolean;
  message: string;
  onClose: () => void;
}) {
  const navigate = useNavigate();

  if (!open) return null;

  const handleConfig = () => {
    onClose();
    navigate("/emailconfig");
  };

  return (
    <div
      className="
        fixed inset-0 z-[9999]
        flex items-center justify-center
        bg-[#0E223B]/80
        backdrop-blur-sm
        p-4
        animate-in fade-in duration-200
      "
      onClick={onClose}
    >
      <div
        className="
          relative
          w-full max-w-md
          overflow-hidden
          rounded-2xl
          border border-white/10
          bg-gradient-to-br from-[#0E223B] via-[#1A3355] to-[#0E223B]
          shadow-[0_25px_80px_rgba(0,0,0,0.5)]
          animate-in
          zoom-in-95
          slide-in-from-bottom-3
          duration-300
        "
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative Background Glows - Updated with new colors */}
        <div
          className="
            absolute -top-24 -right-24
            h-64 w-64
            rounded-full
            bg-[#8EE147]/10
            blur-3xl
          "
        />
        <div
          className="
            absolute -bottom-24 -left-24
            h-64 w-64
            rounded-full
            bg-[#8EE147]/5
            blur-3xl
          "
        />
        
        {/* Additional accent glow */}
        <div
          className="
            absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
            h-96 w-96
            rounded-full
            bg-[#8EE147]/5
            blur-3xl
          "
        />

        {/* Close Button - Updated with new colors */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="
            absolute right-4 top-4
            flex h-9 w-9
            items-center justify-center
            rounded-full
            bg-[#0E223B]/80
            text-slate-400
            transition-all duration-300
            hover:bg-[#8EE147]/20
            hover:text-[#8EE147]
            hover:rotate-90
            hover:scale-110
            backdrop-blur-sm
            border border-white/10
          "
        >
          <X className="h-4.5 w-4.5" />
        </button>

        <div className="p-7 sm:p-8">
          {/* Icon Section - Updated with new colors */}
          <div className="mb-6 flex items-center justify-center">
            <div className="relative">
              {/* Pulsing Glow - Updated with new colors */}
              <div
                className="
                  absolute inset-0
                  rounded-2xl
                  bg-[#8EE147]/20
                  blur-2xl
                  animate-pulse
                "
              />
              
              {/* Main Icon Container - Updated with new colors */}
              <div
                className="
                  relative
                  flex h-20 w-20
                  items-center justify-center
                  rounded-2xl
                  bg-gradient-to-br
                  from-[#8EE147]
                  via-[#6EC035]
                  to-[#5AA82E]
                  shadow-lg
                  shadow-[#8EE147]/30
                  transition-transform
                  duration-300
                  hover:scale-105
                "
              >
                <Mail
                  className="
                    relative z-10
                    h-8 w-8
                    text-[#0E223B]
                  "
                />

                {/* Settings Badge - Updated with new colors */}
                <div
                  className="
                    absolute -right-2 -bottom-2
                    flex h-8 w-8
                    items-center justify-center
                    rounded-full
                    border-4 border-[#0E223B]
                    bg-gradient-to-br from-white to-gray-50
                    shadow-md
                    animate-bounce
                    [animation-duration:2s]
                  "
                >
                  <Settings2 className="h-4 w-4 text-[#8EE147]" />
                </div>
              </div>
            </div>
          </div>

          {/* Content - Updated with new colors */}
          <div className="text-center">
            <h2
              className="
                text-2xl sm:text-3xl
                font-bold
                tracking-tight
                bg-gradient-to-r
                from-[#8EE147]
                via-[#6EC035]
                to-[#5AA82E]
                bg-clip-text
                text-transparent
              "
            >
              Email Setup Required
            </h2>

            <p
              className="
                mt-2.5
                text-sm
                leading-6
                text-slate-400
                max-w-xs
                mx-auto
              "
            >
              Your email settings need to be configured before you can
              continue.
            </p>
          </div>

          {/* Message Card - Updated with new colors */}
          <div
            className="
              mt-6
              rounded-xl
              border border-[#8EE147]/20
              bg-gradient-to-br
              from-[#8EE147]/10
              to-[#6EC035]/5
              p-4
              backdrop-blur-sm
              shadow-inner
              shadow-[#8EE147]/5
            "
          >
            <div className="flex gap-3 items-start">
              <div
                className="
                  mt-0.5
                  flex h-8 w-8 shrink-0
                  items-center justify-center
                  rounded-lg
                  bg-[#8EE147]/20
                "
              >
                <Mail className="h-4 w-4 text-[#8EE147]" />
              </div>

              <p
                className="
                  text-sm
                  leading-6
                  text-[#8EE147]
                  font-medium
                "
              >
                {message}
              </p>
            </div>
          </div>

          {/* Actions - Updated with new colors */}
          <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              onClick={onClose}
              className="
                h-11
                rounded-xl
                border-2
                border-white/20
                px-6
                font-medium
                text-black
                transition-all
                duration-300
                hover:bg-[#8EE147]/10
                hover:border-[#8EE147]/40
                hover:text-[#8EE147]
                hover:scale-[1.02]
              "
            >
              Cancel
            </Button>

            <Button
              onClick={handleConfig}
              className="
                group
                relative
                h-11
                rounded-xl
                bg-gradient-to-r
                from-[#8EE147]
                via-[#6EC035]
                to-[#5AA82E]
                px-6
                text-[#0E223B]
                font-medium
                shadow-lg
                shadow-[#8EE147]/25
                transition-all
                duration-300
                hover:-translate-y-0.5
                hover:shadow-xl
                hover:shadow-[#8EE147]/35
                active:scale-95
                overflow-hidden
              "
            >
              {/* Button Shine Effect */}
              <div
                className="
                  absolute inset-0
                  bg-gradient-to-r
                  from-transparent
                  via-white/30
                  to-transparent
                  -translate-x-full
                  group-hover:translate-x-full
                  transition-transform
                  duration-700
                "
              />

              <Settings2 className="mr-2 h-4 w-4" />
              Go to Config
              <ArrowRight
                className="
                  ml-2
                  h-4 w-4
                  transition-transform
                  duration-300
                  group-hover:translate-x-1.5
                "
              />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}