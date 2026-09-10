import { useState } from 'react';

export default function CalculadoraEconomia() {
  const [clientes, setClientes] = useState<number>(50);
  const [custoPapel, setCustoPapel] = useState<number>(1.20);
  const [consumo, setConsumo] = useState<number>(10);
  const [custoSecador, setCustoSecador] = useState<number>(450);

  const economiaMensal = (clientes * consumo * custoPapel) - (custoSecador / 12);
  const economiaAnual = economiaMensal * 12;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Calculadora de Economia com Secadores
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            Descubra quanto sua empresa pode economizar ao substituir o papel toalha por secadores de mãos.
          </p>
        </div>

        <div className="bg-white shadow-xl rounded-lg p-6 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Insira seus dados</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="clientes" className="block text-sm font-medium text-gray-700 mb-1">
                Número de clientes/dia
              </label>
              <input
                id="clientes"
                type="number"
                value={clientes}
                onChange={(e) => setClientes(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="custoPapel" className="block text-sm font-medium text-gray-700 mb-1">
                Custo médio do papel toalha (R$)
              </label>
              <input
                id="custoPapel"
                type="number"
                step="0.01"
                value={custoPapel}
                onChange={(e) => setCustoPapel(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="consumo" className="block text-sm font-medium text-gray-700 mb-1">
                Consumo médio diário (unidades)
              </label>
              <input
                id="consumo"
                type="number"
                value={consumo}
                onChange={(e) => setConsumo(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="custoSecador" className="block text-sm font-medium text-gray-700 mb-1">
                Custo do secador (R$)
              </label>
              <input
                id="custoSecador"
                type="number"
                step="0.01"
                value={custoSecador}
                onChange={(e) => setCustoSecador(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-600 to-green-600 rounded-xl p-8 text-white">
          <h2 className="text-2xl font-bold mb-4">Resultado da Simulação</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white bg-opacity-20 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-2">Economia Mensal</h3>
              <p className="text-3xl font-bold">R$ {economiaMensal.toFixed(2)}</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-2">Economia Anual</h3>
              <p className="text-3xl font-bold">R$ {economiaAnual.toFixed(2)}</p>
            </div>
          </div>
          <p className="mt-6 text-lg max-w-2xl">
            Esta é uma estimativa baseada nos dados fornecidos. Para um cálculo personalizado e uma proposta comercial detalhada, preencha o formulário abaixo.
          </p>
          <button className="mt-6 bg-white text-blue-600 font-bold py-3 px-8 rounded-lg hover:bg-gray-100 transition-colors">
            Solicitar Proposta Personalizada
          </button>
        </div>
      </div>
    </div>
  );
}