export default function ReturnPolicy() {
  return (
    <main className="min-h-screen bg-[#f9f9f7]">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
        <h1 className="text-3xl sm:text-4xl font-light text-[#111] mb-8">
          Return Policy
        </h1>

        <div className="max-w-none space-y-6">
          <section>
            <h2 className="text-xl font-light text-[#111] mb-3">
              Returns
            </h2>
            <p className="text-[#111]/70 leading-relaxed font-light">
              We want you to love your purchase. If you're not completely satisfied, you may return
              unworn, unwashed items with tags attached within 30 days of delivery for a full refund
              or exchange.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-light text-[#111] mb-3">
              Conditions
            </h2>
            <ul className="list-disc list-inside space-y-2 text-[#111]/70 font-light">
              <li>Items must be unworn, unwashed, and in original condition</li>
              <li>All original tags and labels must be attached</li>
              <li>Items must be returned in original packaging when possible</li>
              <li>Proof of purchase is required</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-light text-[#111] mb-3">
              How to Return
            </h2>
            <p className="text-[#111]/70 leading-relaxed mb-3 font-light">
              To initiate a return:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-[#111]/70 font-light">
              <li>Contact us at the email or phone number provided at checkout</li>
              <li>Include your order number and reason for return</li>
              <li>We'll provide you with a return authorization and shipping instructions</li>
              <li>Ship the item(s) back to us within 7 days of receiving authorization</li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-light text-[#111] mb-3">
              Refunds
            </h2>
            <p className="text-[#111]/70 leading-relaxed font-light">
              Once we receive and inspect your return, we'll process your refund within 5-7 business
              days. Refunds will be issued to the original payment method. Shipping costs are
              non-refundable unless the item is defective or we made an error.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-light text-[#111] mb-3">
              Exchanges
            </h2>
            <p className="text-[#111]/70 leading-relaxed font-light">
              We currently offer exchanges for different sizes. If you need a different size, please
              contact us with your order number and the size you'd like to exchange for. Exchanges
              are subject to availability.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-light text-[#111] mb-3">
              Final Sale Items
            </h2>
            <p className="text-[#111]/70 leading-relaxed font-light">
              Items marked as "Final Sale" are not eligible for return or exchange unless defective.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-light text-[#111] mb-3">
              Questions?
            </h2>
            <p className="text-[#111]/70 leading-relaxed font-light">
              If you have any questions about our return policy, please contact us through our
              Instagram <a href="https://instagram.com/uthinkdifferent" target="_blank" rel="noopener noreferrer" className="text-[#111] hover:underline">@uthinkdifferent</a> or reach out via the contact information provided at checkout.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
