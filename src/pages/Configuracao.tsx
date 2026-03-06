import { useState, useEffect } from "react";
import AppLayout from "@/components/AppLayout";
import { useBotConfig, useSaveBotConfig, BotConfig } from "@/hooks/useBotConfig";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Settings, Power } from "lucide-react";

const SYMBOLS = ["SOLUSDT", "ETHUSDT"];

const Configuracao = () => {
  const [symbol, setSymbol] = useState(SYMBOLS[0]);
  const { data: config, isLoading } = useBotConfig(symbol);
  const saveMutation = useSaveBotConfig();
  const { toast } = useToast();

  const [form, setForm] = useState<BotConfig>({
    symbol: SYMBOLS[0],
    candle_duplo_compra_ativo: false,
    candle_duplo_venda_ativo: false,
    intrabar_compra_ativo: false,
    intrabar_venda_ativo: false,
    intrabar_percentual_compra: 0,
    intrabar_percentual_venda: 0,
    mean_reversao_ativo: false,
    mean_reversao_percentual_entrada: 0,
    mean_reversao_percentual_alvo: 0,
    valor_operacao: 0,
    bot_ativo: false,
  });

  useEffect(() => {
    if (config) {
      setForm({ ...config, symbol });
    }
  }, [config, symbol]);

  const handleCheckbox = (field: keyof BotConfig) => (checked: boolean) => {
    setForm((prev) => ({ ...prev, [field]: checked }));
  };

  const handleNumber = (field: keyof BotConfig) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setForm((prev) => ({ ...prev, [field]: val === "" ? 0 : parseFloat(val) }));
  };

  const handleSave = () => {
    if (form.intrabar_compra_ativo && form.intrabar_percentual_compra <= 0) {
      toast({ title: "Erro", description: "Percentual Intrabar Compra deve ser maior que 0.", variant: "destructive" });
      return;
    }
    if (form.intrabar_venda_ativo && form.intrabar_percentual_venda <= 0) {
      toast({ title: "Erro", description: "Percentual Intrabar Venda deve ser maior que 0.", variant: "destructive" });
      return;
    }
    if (form.valor_operacao <= 0) {
      toast({ title: "Erro", description: "Valor por operação deve ser maior que 0.", variant: "destructive" });
      return;
    }

    saveMutation.mutate(form, {
      onSuccess: () => {
        toast({ title: "Sucesso", description: "Configuração salva com sucesso!" });
      },
      onError: () => {
        toast({ title: "Erro", description: "Falha ao salvar configuração.", variant: "destructive" });
      },
    });
  };

  return (
    <AppLayout>
      <div className="space-y-5 max-w-2xl mx-auto">
        <h1 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Configuração do Robô
        </h1>

        {/* Status do Bot */}
        <div className="flex items-center gap-2 text-sm">
          <Power className={`h-4 w-4 ${form.bot_ativo ? "text-green-500" : "text-red-500"}`} />
          <span className="text-muted-foreground">Status atual:</span>
          <span className={`font-semibold ${form.bot_ativo ? "text-green-500" : "text-red-500"}`}>
            {form.bot_ativo ? "🟢 Ativo" : "🔴 Pausado"}
          </span>
        </div>

        {/* Seletor de Par */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Selecionar Par</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={symbol} onValueChange={(v) => setSymbol(v)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SYMBOLS.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="text-center text-sm text-muted-foreground py-8">Carregando configuração...</div>
        ) : (
          <>
            {/* Estratégias Ativas */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Estratégias Ativas</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {([
                  ["candle_duplo_compra_ativo", "Candle Duplo Compra"],
                  ["candle_duplo_venda_ativo", "Candle Duplo Venda"],
                  ["intrabar_compra_ativo", "Intrabar Compra"],
                  ["intrabar_venda_ativo", "Intrabar Venda"],
                  ["mean_reversao_ativo", "Mean Reversão"],
                ] as const).map(([field, label]) => (
                  <div key={field} className="flex items-center gap-2">
                    <Checkbox
                      id={field}
                      checked={!!form[field]}
                      onCheckedChange={handleCheckbox(field)}
                    />
                    <Label htmlFor={field} className="text-sm cursor-pointer">{label}</Label>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Percentuais Intrabar */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Percentuais Intrabar</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="pct_compra" className="text-xs text-muted-foreground">Percentual Compra (%)</Label>
                  <Input
                    id="pct_compra"
                    type="number"
                    step="0.0001"
                    min="0"
                    value={form.intrabar_percentual_compra || ""}
                    onChange={handleNumber("intrabar_percentual_compra")}
                    placeholder="0.0000"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="pct_venda" className="text-xs text-muted-foreground">Percentual Venda (%)</Label>
                  <Input
                    id="pct_venda"
                    type="number"
                    step="0.0001"
                    min="0"
                    value={form.intrabar_percentual_venda || ""}
                    onChange={handleNumber("intrabar_percentual_venda")}
                    placeholder="0.0000"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Parâmetros Mean Reversão */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Parâmetros Mean Reversão</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="mr_entrada" className="text-xs text-muted-foreground">Percentual Entrada no Range (%)</Label>
                  <Input
                    id="mr_entrada"
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.mean_reversao_percentual_entrada || ""}
                    onChange={handleNumber("mean_reversao_percentual_entrada")}
                    placeholder="0.00"
                    disabled={!form.mean_reversao_ativo}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="mr_alvo" className="text-xs text-muted-foreground">Percentual Preço Alvo (%)</Label>
                  <Input
                    id="mr_alvo"
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.mean_reversao_percentual_alvo || ""}
                    onChange={handleNumber("mean_reversao_percentual_alvo")}
                    placeholder="0.00"
                    disabled={!form.mean_reversao_ativo}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Gestão */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Gestão</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="valor_op" className="text-xs text-muted-foreground">Valor por Operação (USDT)</Label>
                  <Input
                    id="valor_op"
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.valor_operacao || ""}
                    onChange={handleNumber("valor_operacao")}
                    placeholder="0.00"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="bot_ativo" className="text-sm">Bot Ativo</Label>
                  <Switch
                    id="bot_ativo"
                    checked={form.bot_ativo}
                    onCheckedChange={(checked) => setForm((prev) => ({ ...prev, bot_ativo: checked }))}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Salvar */}
            <Button
              onClick={handleSave}
              disabled={saveMutation.isPending}
              className="w-full"
            >
              {saveMutation.isPending ? "Salvando..." : "Salvar Configuração"}
            </Button>
          </>
        )}
      </div>
    </AppLayout>
  );
};

export default Configuracao;
