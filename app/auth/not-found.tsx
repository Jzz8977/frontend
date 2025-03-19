"use client";

import Link from "next/link";
import { ArrowLeft, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function AuthNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 px-4">
      <Card className="w-full max-w-md border-none shadow-lg">
        <CardHeader className="text-center space-y-1">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-orange-100 p-3">
              <svg
                className="h-10 w-10 text-orange-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight">
            页面不存在
          </CardTitle>
          <p className="text-lg text-muted-foreground">
            认证页面未找到
          </p>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-gray-600">
            您访问的认证页面不存在。请检查网址是否正确，或点击下方链接前往登录页面。
          </p>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-center gap-4 pt-2">
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href="/auth/login">
              <LogIn className="mr-2 h-4 w-4" />
              前往登录
            </Link>
          </Button>
          <Button asChild className="w-full sm:w-auto">
            <Link href="javascript:history.back()">
              <ArrowLeft className="mr-2 h-4 w-4" />
              返回上一页
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 