import React from "react";
import { assets } from "../assets/assets";
import { Star } from "lucide-react";
import { SignIn } from "@clerk/clerk-react";

const Login = () => {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">

      {/* Background Image */}
      <img
        src={assets.bgImage}
        alt=""
        className="absolute top-0 left-0 -z-10 w-full h-full object-cover"
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 -z-10 bg-black/30" />

      {/* Left side: Branding */}
      <div className="flex-1 flex flex-col items-start justify-between p-8 md:p-12 lg:pl-20 xl:pl-32">

        <img
          src={assets.logo}
          alt=""
          className="h-10 object-contain"
        />

        <div className="max-md:mt-12">

          {/* Social proof */}
          <div className="flex items-center gap-3 mb-6">
            <img
              src={assets.group_users}
              alt=""
              className="h-9 md:h-11"
            />
            <div>
              <div className="flex gap-0.5">
                {Array(5).fill(0).map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 text-transparent fill-amber-400" />
                ))}
              </div>
              <p className="text-sm text-white/80 mt-0.5">Used by 12k+ people</p>
            </div>
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight mb-4">
            More than just
            <br />
            <span className="text-white/70">friends</span> — truly
            <br />
            connect.
          </h1>

          <p className="text-lg md:text-xl text-white/60 max-w-sm leading-relaxed">
            Join the global community on PingUp.
          </p>

        </div>

        <span className="md:h-10"></span>
      </div>

      {/* Right side: Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">
          <SignIn />
        </div>
      </div>

    </div>
  );
};

export default Login;
