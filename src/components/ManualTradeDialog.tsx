import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
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
import { toast } from "@/hooks/use-toast";
import { fetchJson, ApiJsonError } from "@/lib/apiFetch";

const ENDPOINT = "/trading_bot/api/api_trade_manual.asp";

const nowParts = () => {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return {
    data: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    hora: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  };
};

const ManualTradeDialog = () => {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const init = nowParts();
  const [form, setForm] = useState({
    ativo: "SOL/USDT",
    tipo: "COMPRA" as "COMPRA" | "VENDA",
    data: init.data,
    hora: init.hora,
    entrada: "",
    saida: "",
    quantidade: "",
    taxa: "",
    taxa_moeda: "USDT" as "USDT" | "SOL",
    lucro: "",
  });

  const update = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.ativo.trim()) {
      toast({ title: "Ativo obrigatório", variant: "destructive" });
      return;
    }
    const numEntrada = parseFloat(form.entrada);
    const numSaida = parseFloat(form.saida);
    const numQuantidade = parseFloat(form.quantidade);
    const numTaxa = parseFloat(form.taxa);
    const numLucro = parseFloat(form.lucro);
    if ([numEntrada, numSaida, numQuantidade, numTaxa, numLucro].some((n) => Number.isNaN(n))) {
      toast({
        title: "Valores numéricos inválidos",
        description: "Preencha entrada, saída, quantidade, taxa e lucro com números válidos.",
        variant: "destructive",
      });
      return;
    }

    const payload = {
      ativo: form.ativo.trim(),
      tipo: form.tipo,
      data: form.data,
      hora: form.hora,
      entrada: numEntrada,
      saida: numSaida,
      quantidade: numQuantidade,
      taxa: numTaxa,
      taxa_moeda: form.taxa_moeda,
      lucro: numLucro,
      estrategia: "trade manual",
    };

    setSubmitting(true);
    try {
      await fetchJson(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      toast({ title: "Trade manual lançado com sucesso" });
      queryClient.invalidateQueries({ queryKey: ["operacoes"] });
      setOpen(false);
    } catch (err) {
      const msg = err instanceof ApiJsonError ? err.message : err instanceof Error ? err.message : String(err);
      toast({ title: "Erro ao lançar trade", description: msg, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1">
          <Plus className="h-4 w-4" /> Lançar Trade Manual
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Lançar Trade Manual</DialogTitle>
          <DialogDescription>
            Registra uma operação manualmente. Estratégia será enviada como "trade manual".
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="ativo">Ativo (par)</Label>
              <Input id="ativo" value={form.ativo} onChange={(e) => update("ativo", e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Tipo</Label>
              <Select value={form.tipo} onValueChange={(v) => update("tipo", v as "COMPRA" | "VENDA")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="COMPRA">COMPRA</SelectItem>
                  <SelectItem value="VENDA">VENDA</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="data">Data</Label>
              <Input id="data" type="date" value={form.data} onChange={(e) => update("data", e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="hora">Hora</Label>
              <Input id="hora" type="time" value={form.hora} onChange={(e) => update("hora", e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="entrada">Preço de compra (entrada)</Label>
              <Input id="entrada" type="number" step="0.0001" value={form.entrada} onChange={(e) => update("entrada", e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="saida">Preço de venda (saída)</Label>
              <Input id="saida" type="number" step="0.0001" value={form.saida} onChange={(e) => update("saida", e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="quantidade">Quantidade</Label>
              <Input id="quantidade" type="number" step="0.00000001" value={form.quantidade} onChange={(e) => update("quantidade", e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="taxa">Taxa</Label>
              <Input id="taxa" type="number" step="0.00000001" value={form.taxa} onChange={(e) => update("taxa", e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Taxa em</Label>
              <Select value={form.taxa_moeda} onValueChange={(v) => update("taxa_moeda", v as "USDT" | "SOL")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="USDT">USDT</SelectItem>
                  <SelectItem value="SOL">SOL</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1 col-span-2">
              <Label htmlFor="lucro">Lucro</Label>
              <Input id="lucro" type="number" step="0.0001" value={form.lucro} onChange={(e) => update("lucro", e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={submitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Lançar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ManualTradeDialog;
