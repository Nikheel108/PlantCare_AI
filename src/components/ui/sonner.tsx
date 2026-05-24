import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-surface-1 group-[.toaster]:text-white group-[.toaster]:border-white/[0.06] group-[.toaster]:shadow-lg group-[.toaster]:backdrop-blur-xl",
          description: "group-[.toast]:text-white/50",
          actionButton: "group-[.toast]:bg-neon-green group-[.toast]:text-surface-0",
          cancelButton: "group-[.toast]:bg-white/10 group-[.toast]:text-white/60",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
