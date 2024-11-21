"use client";

import { useEffect, useState } from "react";

interface Ticket {
  id: number;
  subject: string;
  status: string;
