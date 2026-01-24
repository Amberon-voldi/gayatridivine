import { redirect } from "next/navigation";

export default function RegisterPage({ searchParams }) {
  const target = typeof searchParams?.redirect === "string" ? searchParams.redirect : "/";
  const qp = target && target !== "/" ? `?redirect=${encodeURIComponent(target)}` : "";
  redirect(`/login${qp}`);
}

