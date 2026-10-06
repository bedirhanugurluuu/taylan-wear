export function MockShopNotice() {
  return (
    <section
      className="mock-shop-notice"
      aria-labelledby="mock-shop-notice-heading"
    >
      <div className="inner">
        <h2 id="mock-shop-notice-heading">Mağaza bağlı değil</h2>
        <p>
          Henüz bir Shopify mağazası bağlanmadığı için örnek ürünler
          görüntüleniyor.
        </p>
        <p>
          Terminalde <code>npx shopify hydrogen link</code> komutuyla mağazanı
          bağlayabilirsin.
        </p>
      </div>
    </section>
  );
}
