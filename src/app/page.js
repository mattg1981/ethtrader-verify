'use client';

import React, {Suspense, useState} from "react";
import Verify from "@/app/verify";



export default function Home() {

  return (
          <main className="flex min-h-screen flex-col items-center justify-between p-24">
                  <Suspense fallback={<>Loading...</>}>
                      <Verify></Verify>
                  </Suspense>
          </main>
  )
}
