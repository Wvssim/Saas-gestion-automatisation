"use client";

import React, { useState } from "react";
import Image from "next/image";
import { TopProduct } from "@/types/dashboard";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { MoreVertical } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface TopProductsTableProps {
  products: TopProduct[];
  isLoading?: boolean;
}

const LoadingSkeleton = () => (
  <Card>
    <CardHeader>
      <CardTitle>Top Products</CardTitle>
      <CardDescription>Your best-selling products by revenue.</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-1">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    </CardContent>
  </Card>
);

export const TopProductsTable: React.FC<TopProductsTableProps> = ({
  products,
  isLoading = false,
}) => {
  if (isLoading) return <LoadingSkeleton />;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Products</CardTitle>
        <CardDescription>
          Your best-selling products by revenue.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Product</TableHead>
              <TableHead className="text-right">Revenue</TableHead>
              <TableHead className="text-right">Orders</TableHead>
              <TableHead className="text-right">Stock</TableHead>
              <TableHead className="w-[50px] text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center overflow-hidden">
                      {product.image ? (
                        <Image
                          src={product.image}
                          alt={product.name}
                          width={40}
                          height={40}
                          className="object-cover"
                        />
                      ) : (
                        <span className="text-lg">📦</span>
                      )}
                    </div>
                    <span className="font-medium text-foreground">
                      {product.name}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right font-semibold text-foreground">
                  ${product.revenue.toLocaleString()}
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {product.orders}
                </TableCell>
                <TableCell className="text-right">
                  <Badge
                    variant={
                      product.stock > 20
                        ? "success"
                        : product.stock > 0
                          ? "warning"
                          : "destructive"
                    }
                  >
                    {product.stock} units
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
