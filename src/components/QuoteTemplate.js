import React from 'react'
import { format } from 'date-fns'

const QuoteTemplate = ({ quote }) => {
  const currentDate = new Date()
  const formattedDate = format(currentDate, 'dd/MM/yyyy')

  // Calculate totals
  const calculateTotal = () => {
    // Convert service price to number, default to 0 if undefined
    const servicePrice = parseFloat(quote.quote.service_price || 0)
    
    // Calculate products total
    const productsTotal = quote.quote.products 
      ? quote.quote.products.reduce((sum, product) => {
          const productPrice = parseFloat(product.price || 0)
          return sum + productPrice
        }, 0)
      : 0

    // Add service and products totals
    const total = servicePrice + productsTotal
    
    // Format to 2 decimal places
    return total.toFixed(2)
  }

  // Format individual prices
  const formatPrice = (price) => {
    return parseFloat(price || 0).toFixed(2)
  }

  return (
    <div className="p-8 max-w-4xl mx-auto flex flex-col min-h-full">
      {/* Header */}
      <div className="flex justify-between items-start mb-12">
        <div className="flex items-center">
          <img src="/logo.svg" alt="ServicePro" className="h-16" />
        </div>
        <div className="text-right">
          <h1 className="text-xl font-bold mb-1">Devis {quote.quote.id}</h1>
          <p className="text-sm text-gray-600">cree le : {formattedDate} a paris</p>
        </div>
      </div>

      {/* Client Info and Description */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h2 className="font-bold mb-2">{quote.quote.client?.first_name} {quote.quote.client?.last_name}</h2>
          <p>{quote.quote.client?.address}</p>
          <p>{quote.quote.client?.zip_code}</p>
        </div>
        <div>
          <h2 className="font-bold mb-2">Description de l'intervention</h2>
          <p className="mb-2">{quote.quote.service_name}</p>
          <p className="text-sm text-gray-600">Date: {format(new Date(quote.quote.created_at), 'dd/MM/yyyy')}</p>
          <p className="text-sm text-gray-600">Heure: {format(new Date(quote.quote.created_at), 'HH:mm')}</p>
          <p className="text-sm text-gray-600">Montant H.T vente: {formatPrice(quote.quote.total)} € HT</p>
        </div>
      </div>

      {/* Table */}
      <table className="w-full mb-8">
        <thead>
          <tr className="border-b">
            <th className="text-left py-2">Description</th>
            <th className="text-right py-2">Prix H.T</th>
            <th className="text-right py-2">TVA</th>
            <th className="text-right py-2">Montant</th>
          </tr>
        </thead>
        <tbody>
          {/* Service */}
          <tr className="border-b">
            <td className="py-2">{quote.quote.service_name}</td>
            <td className="text-right">{formatPrice(quote.quote.service_price)}</td>
            <td className="text-right">0.00</td>
            <td className="text-right">{formatPrice(quote.quote.service_price)}</td>
          </tr>
          
          {/* Products */}
          {quote.quote.products && quote.quote.products.map((product) => (
            <tr key={product.id} className="border-b">
              <td className="py-2">{product.name}</td>
              <td className="text-right">{formatPrice(product.price)}</td>
              <td className="text-right">0.00</td>
              <td className="text-right">{formatPrice(product.price)}</td>
            </tr>
          ))}
          
          {/* Total */}
          <tr className="border-b font-bold">
            <td className="py-2">Total</td>
            <td className="text-right">{calculateTotal()}</td>
            <td className="text-right">0.00</td>
            <td className="text-right">{calculateTotal()}</td>
          </tr>
        </tbody>
      </table>

      {/* Total Section */}
      <div className="w-full flex justify-end mb-12">
        <div className="w-64">
          <div className="text-right">
            <div className="mb-2 flex justify-between">
              <span>Montant total</span>
              <span>{formatPrice(quote.quote.subtotal)} €</span>
            </div>
            <div className="mb-2 flex justify-between">
              <span>TVA ({quote.quote.tva_percentage || 0}%)</span>
              <span>{formatPrice(quote.quote.tva_amount)} €</span>
            </div>
            <div className="pt-2 border-t border-gray-300 flex justify-between font-bold">
              <span>Prix total</span>
              <span>{formatPrice(quote.quote.total)} €</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto pt-2">
        <div className="w-full bg-gray-100 border border-gray-300 rounded-sm p-1 print:bg-gray-100">
          <div className="text-[4px] text-gray-600 text-center leading-[6px]">
            <p>Société FRANCE CONTRE COURANT - SAS au capital de 1 000,00 € (fixe) € - 10 RUE FONTAINE ST GERMAIN 95230</p>
            <p>SOISY SS MONTMORENCY - Siren 921677241 - RCS PONTOISE - Numéro de tva INTRACOMMUNAUTAIRE FR78921677241 -</p>
            <p>Assurance AXA France IARD Code ASSCO13 - 95, avenue de paris 94300 VINCENNES - Contrat Numéro</p>
            <p>0000X2000201904</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QuoteTemplate
