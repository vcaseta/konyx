// app/page.tsx
"use client";


import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Cookies from "js-cookie";
import Login from "./components/Login";


export const dynamic = "force-dynamic";


export default function Page() {
const router = useRouter();


useEffect(() => {
// Si ya hay token en cookie, redirigir a dashboard
const token = Cookies.get("konyx_token");
if (token) router.replace("/dashboard");
}, [router]);


async function handleOk(token: string) {
if (!token) {
alert("Token inválido");
return;
}


try {
// Guardar token como cookie
Cookies.set("konyx_token", token, {
path: "/",
sameSite: "Strict",
});


// Redirigir al dashboard
router.push("/dashboard");
} catch (e) {
alert("Error al guardar la sesión");
}
}


return (
<main
className="min-h-screen bg-no-repeat bg-center bg-cover flex items-center justify-center p-4"
style={{
backgroundImage: "url(/fondo.png)",
backgroundSize: "100% 100%",
backgroundRepeat: "no-repeat",
}}
>
<div className="w-full max-w-sm">
<Login onOk={handleOk} />
</div>
</main>
);
}
