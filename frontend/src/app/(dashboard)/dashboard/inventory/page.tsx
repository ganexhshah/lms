"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, ClipboardList, Package, Plus, ShoppingCart } from "lucide-react";

import { SoftBadge } from "@/components/shared/soft-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { SearchField } from "@/components/shared/search-field";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useOpsStore } from "@/store/ops-store";
import type { InventoryItem } from "@/types/ops";

const CATEGORIES: InventoryItem["category"][] = [
  "beans",
  "milk",
  "syrups",
  "cups",
  "machines",
  "other",
];

export default function InventoryPage() {
  const inventory = useOpsStore((s) => s.inventory);
  const batches = useOpsStore((s) => s.batches);
  const restock = useOpsStore((s) => s.restock);
  const addInventoryItem = useOpsStore((s) => s.addInventoryItem);
  const logInventoryUsage = useOpsStore((s) => s.logInventoryUsage);
  const [query, setQuery] = useState("");

  const [skuOpen, setSkuOpen] = useState(false);
  const [skuForm, setSkuForm] = useState({
    name: "",
    category: "other" as InventoryItem["category"],
    unit: "",
    minStock: 0,
    stock: 0,
  });

  const [purchaseOpen, setPurchaseOpen] = useState(false);
  const [purchaseForm, setPurchaseForm] = useState({
    itemId: "",
    qty: 0,
    unitCost: 0,
    note: "",
  });

  const [usageForm, setUsageForm] = useState({
    itemId: "",
    qty: 0,
    batch: "",
    note: "",
  });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return inventory;
    return inventory.filter((i) => `${i.name} ${i.category}`.toLowerCase().includes(q));
  }, [inventory, query]);

  const alerts = inventory.filter((i) => i.stock < i.minStock);
  const purchases = useMemo(
    () =>
      inventory.flatMap((item) =>
        (item.purchases ?? []).map((p) => ({ ...p, itemName: item.name, itemUnit: item.unit }))
      ).sort((a, b) => (a.date < b.date ? 1 : -1)),
    [inventory]
  );
  const usageLog = useMemo(
    () =>
      inventory.flatMap((item) =>
        (item.usage ?? []).map((u) => ({ ...u, itemName: item.name, itemUnit: item.unit }))
      ).sort((a, b) => (a.date < b.date ? 1 : -1)),
    [inventory]
  );

  function resetSkuForm() {
    setSkuForm({ name: "", category: "other", unit: "", minStock: 0, stock: 0 });
  }

  function createSku() {
    if (!skuForm.name.trim() || !skuForm.unit.trim()) {
      toast.error("Name and unit are required");
      return;
    }
    addInventoryItem({
      name: skuForm.name,
      category: skuForm.category,
      unit: skuForm.unit,
      minStock: skuForm.minStock,
      stock: skuForm.stock,
    });
    toast.success("SKU added");
    setSkuOpen(false);
    resetSkuForm();
  }

  function resetPurchaseForm() {
    setPurchaseForm({ itemId: "", qty: 0, unitCost: 0, note: "" });
  }

  function createPurchase() {
    const item = inventory.find((i) => i.id === purchaseForm.itemId);
    if (!item) {
      toast.error("Select an item");
      return;
    }
    if (purchaseForm.qty <= 0) {
      toast.error("Quantity must be greater than 0");
      return;
    }
    restock(item.id, purchaseForm.qty, purchaseForm.unitCost, purchaseForm.note || "Purchase");
    toast.success(`Restocked ${item.name}`);
    setPurchaseOpen(false);
    resetPurchaseForm();
  }

  function submitUsage() {
    const item = inventory.find((i) => i.id === usageForm.itemId);
    if (!item) {
      toast.error("Select an item");
      return;
    }
    if (usageForm.qty <= 0) {
      toast.error("Quantity must be greater than 0");
      return;
    }
    if (!usageForm.batch.trim()) {
      toast.error("Select a batch");
      return;
    }
    logInventoryUsage(item.id, usageForm.qty, usageForm.batch, usageForm.note);
    toast.success(`Usage logged for ${item.name}`);
    setUsageForm({ itemId: "", qty: 0, batch: "", note: "" });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory"
        description="Beans, milk, syrups, cups, machines, stock alerts, purchases."
        actions={
          <>
            <Button size="sm" variant="outline" onClick={() => setPurchaseOpen(true)}>
              <ShoppingCart /> Purchase
            </Button>
            <Button size="sm" onClick={() => setSkuOpen(true)}>
              <Plus /> Add SKU
            </Button>
          </>
        }
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="SKUs" value={String(inventory.length)} />
        <Stat label="Low stock" value={String(alerts.length)} />
        <Stat label="Categories" value={String(new Set(inventory.map((i) => i.category)).size)} />
      </div>
      <Card className="shadow-none">
        <Tabs defaultValue="stock">
          <CardHeader className="border-b pb-0 space-y-3">
            <div className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Stock</CardTitle>
              <SearchField value={query} onChange={setQuery} className="max-w-xs" placeholder="Search…" />
            </div>
            <TabsList variant="line">
              <TabsTrigger value="stock">All items</TabsTrigger>
              <TabsTrigger value="alerts">Stock alerts</TabsTrigger>
              <TabsTrigger value="purchases">Purchases</TabsTrigger>
              <TabsTrigger value="usage">Usage</TabsTrigger>
            </TabsList>
          </CardHeader>
          <CardContent className="pt-6">
            <TabsContent value="stock">
              {filtered.length === 0 ? (
                <EmptyState icon={Package} title="No items" description="Add a SKU to get started." />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Min</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((i) => (
                      <TableRow key={i.id}>
                        <TableCell className="font-medium">{i.name}</TableCell>
                        <TableCell><SoftBadge tone="outline">{i.category}</SoftBadge></TableCell>
                        <TableCell className={i.stock < i.minStock ? "text-destructive" : ""}>
                          {i.stock} {i.unit}
                        </TableCell>
                        <TableCell>{i.minStock}</TableCell>
                        <TableCell className="text-right">
                          <Button size="xs" variant="outline" onClick={() => { restock(i.id, 10); toast.success(`Restocked ${i.name}`); }}>
                            +10
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
            <TabsContent value="alerts">
              {alerts.length === 0 ? (
                <EmptyState icon={AlertTriangle} title="No stock alerts" description="All items are above their minimum stock level." />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Min</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {alerts.map((i) => (
                      <TableRow key={i.id}>
                        <TableCell>{i.name}</TableCell>
                        <TableCell className="text-destructive">{i.stock} {i.unit}</TableCell>
                        <TableCell>{i.minStock}</TableCell>
                        <TableCell className="text-right">
                          <Button size="xs" variant="outline" onClick={() => { restock(i.id, 10); toast.success(`Restocked ${i.name}`); }}>
                            +10
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
            <TabsContent value="purchases">
              {purchases.length === 0 ? (
                <EmptyState icon={ShoppingCart} title="No purchases yet" description="Restock an item to log a purchase." />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Unit cost</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Note</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {purchases.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">{p.itemName}</TableCell>
                        <TableCell>{p.date}</TableCell>
                        <TableCell>{p.qty} {p.itemUnit}</TableCell>
                        <TableCell>Rs {p.unitCost.toLocaleString()}</TableCell>
                        <TableCell>Rs {(p.qty * p.unitCost).toLocaleString()}</TableCell>
                        <TableCell className="text-muted-foreground">{p.note}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
            <TabsContent value="usage" className="space-y-4">
              <div className="grid gap-3 rounded-lg border p-3 sm:grid-cols-4 sm:items-end">
                <div className="space-y-1.5 sm:col-span-1">
                  <Label className="text-xs">Item</Label>
                  <Select
                    value={usageForm.itemId || undefined}
                    onValueChange={(v) => setUsageForm({ ...usageForm, itemId: v ?? "" })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select item" />
                    </SelectTrigger>
                    <SelectContent>
                      {inventory.map((i) => (
                        <SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Batch</Label>
                  <Select
                    value={usageForm.batch || undefined}
                    onValueChange={(v) => setUsageForm({ ...usageForm, batch: v ?? "" })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select batch" />
                    </SelectTrigger>
                    <SelectContent>
                      {batches.map((b) => (
                        <SelectItem key={b.id} value={b.name}>{b.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Qty</Label>
                  <Input
                    type="number"
                    value={usageForm.qty}
                    onChange={(e) => setUsageForm({ ...usageForm, qty: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Note</Label>
                  <Input
                    value={usageForm.note}
                    onChange={(e) => setUsageForm({ ...usageForm, note: e.target.value })}
                    placeholder="Optional"
                  />
                </div>
                <Button size="sm" onClick={submitUsage} className="sm:col-span-4 sm:w-fit">
                  <ClipboardList /> Log usage
                </Button>
              </div>
              {usageLog.length === 0 ? (
                <EmptyState icon={ClipboardList} title="No usage logged" description="Log usage to see it here." />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Batch</TableHead>
                      <TableHead>Note</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usageLog.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell className="font-medium">{u.itemName}</TableCell>
                        <TableCell>{u.date}</TableCell>
                        <TableCell>{u.qty} {u.itemUnit}</TableCell>
                        <TableCell>{u.batch}</TableCell>
                        <TableCell className="text-muted-foreground">{u.note}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>

      <Dialog
        open={skuOpen}
        onOpenChange={(next) => {
          setSkuOpen(next);
          if (!next) resetSkuForm();
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add SKU</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Name</Label>
              <Input value={skuForm.name} onChange={(e) => setSkuForm({ ...skuForm, name: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <Label className="text-xs">Category</Label>
                <Select
                  value={skuForm.category}
                  onValueChange={(v) => v && setSkuForm({ ...skuForm, category: v as InventoryItem["category"] })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Unit</Label>
                <Input
                  value={skuForm.unit}
                  onChange={(e) => setSkuForm({ ...skuForm, unit: e.target.value })}
                  placeholder="kg, pcs, bottle…"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <Label className="text-xs">Starting stock</Label>
                <Input
                  type="number"
                  value={skuForm.stock}
                  onChange={(e) => setSkuForm({ ...skuForm, stock: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Min stock</Label>
                <Input
                  type="number"
                  value={skuForm.minStock}
                  onChange={(e) => setSkuForm({ ...skuForm, minStock: Number(e.target.value) })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSkuOpen(false)}>Cancel</Button>
            <Button onClick={createSku}>Add SKU</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={purchaseOpen}
        onOpenChange={(next) => {
          setPurchaseOpen(next);
          if (!next) resetPurchaseForm();
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Purchase / restock</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Item</Label>
              <Select
                value={purchaseForm.itemId || undefined}
                onValueChange={(v) => setPurchaseForm({ ...purchaseForm, itemId: v ?? "" })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select item" />
                </SelectTrigger>
                <SelectContent>
                  {inventory.map((i) => (
                    <SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <Label className="text-xs">Quantity</Label>
                <Input
                  type="number"
                  value={purchaseForm.qty}
                  onChange={(e) => setPurchaseForm({ ...purchaseForm, qty: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Unit cost (Rs)</Label>
                <Input
                  type="number"
                  value={purchaseForm.unitCost}
                  onChange={(e) => setPurchaseForm({ ...purchaseForm, unitCost: Number(e.target.value) })}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Note</Label>
              <Input
                value={purchaseForm.note}
                onChange={(e) => setPurchaseForm({ ...purchaseForm, note: e.target.value })}
                placeholder="Optional"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPurchaseOpen(false)}>Cancel</Button>
            <Button onClick={createPurchase}>Save purchase</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card className="shadow-none">
      <CardContent className="pt-4">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-2xl font-semibold tabular-nums">{value}</p>
      </CardContent>
    </Card>
  );
}
