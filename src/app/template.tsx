import { AnimatedPage } from "@/components/ui/MotionPrimitives";

export default function Template({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AnimatedPage>{children}</AnimatedPage>;
}
