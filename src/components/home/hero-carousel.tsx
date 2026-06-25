"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { getWhatsAppUrl } from "@/lib/whatsapp";
import type { Product } from "@/lib/sanity-products";

interface HeroCarouselProps {
  featuredProducts?: Product[];
  allProducts?: Product[];
}

function getProductImagesForMosaic(products: Product[], count: number = 12): Array<{ url: string; alt: string; title: string; slug: string; categorySlug: string }> {
  const images: Array<{ url: string; alt: string; title: string; slug: string; categorySlug: string }> = []
  
  for (const product of products) {
    const extImg = (product as any).externalImages?.[0]
    const intImg = product.images?.[0] as any
    const url = extImg?.url || intImg?.url || ''
    
    if (url) {
      images.push({
        url,
        alt: extImg?.alt || intImg?.alt || product.title,
        title: product.title,
        slug: product.slug?.current || "",
        categorySlug: (product.categories[0] as any)?.slug || 'produtos',
      })
      if (images.length >= count) break
    }
  }
  
  return images
}

function filterProductsByCategory(products: Product[], categorySlug: string): Product[] {
  return products.filter((p) =>
    (p.categories as any[])?.some((c: any) => c.slug === categorySlug)
  ).slice(0, 8)
}

export function HeroCarousel({ featuredProducts = [], allProducts = [] }: HeroCarouselProps) {
  const [current, setCurrent] = useState(0);
  
  const mosaicImages = getProductImagesForMosaic(allProducts.length > 0 ? allProducts : featuredProducts, 12);
  
  const lixeirasInoxProducts = filterProductsByCategory(allProducts, "lixeiras-inox");
  const coletaSeletivaProducts = filterProductsByCategory(allProducts, "coleta-seletiva");
  
  const slides = [
    {
      title: "Lixeiras em Inox",
      subtitle: "ELEGÂNCIA E DURABILIDADE PARA TODOS OS AMBIENTES",
      description: "Lixeiras em aço inox de alta qualidade, ideais para oferecer resistência, funcionalidade e design sofisticado para qualquer espaço.",
      cta: "Ver Lixeiras em Inox",
      href: "/produtos/lixeiras-inox",
      products: lixeirasInoxProducts,
      isMosaic: false,
    },
    {
      title: "Coleta Seletiva",
      subtitle: "PARA UMA SEPARAÇÃO EFICIENTE E ORGANIZADA DOS RESÍDUOS",
      description: "Facilite a separação dos resíduos com nossas lixeiras para coleta seletiva em aço inox e plástico, ideais para qualquer ambiente.",
      cta: "Ver Coleta Seletiva",
      href: "/produtos/coleta-seletiva",
      products: coletaSeletivaProducts,
      isMosaic: false,
    },
    {
      title: "Nossa Linha Completa",
      subtitle: "QUALIDADE E EFICIÊNCIA EM CADA DETALHE",
      description: "Conheça todos os nossos produtos de higiene e limpeza profissional.",
      cta: "Explorar Catálogo",
      href: "/produtos",
      isMosaic: true,
      mosaicImages: mosaicImages,
    },
  ];
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);
  
  const handlePrevious = () => {
    setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="relative h-[500px] md:h-[600px] lg:h-[700px] overflow-hidden bg-gray-50">
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === current ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
        >
          {slide.isMosaic ? (
            <div className="h-full flex flex-col lg:flex-row">
              <div className="w-full lg:w-2/5 pl-4 md:pl-8 lg:pl-16 pr-4 py-6 md:py-10 flex flex-col justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute inset-0" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                  }} />
                </div>
                <div className="relative z-10">
                  <p className="text-sm md:text-base font-semibold tracking-widest text-primary-foreground/80 mb-2">
                    {slide.subtitle}
                  </p>
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4 leading-tight">
                    {slide.title}
                  </h1>
                  <p className="text-sm md:text-base text-gray-300 mb-6 max-w-md">
                    {slide.description}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link
                      href={slide.href}
                      className="inline-flex items-center justify-center rounded-md text-sm font-semibold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-white text-gray-900 hover:bg-gray-100 h-12 px-6 py-2"
                    >
                      {slide.cta}
                    </Link>
                    <a
                      href={getWhatsAppUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-white/30 bg-white/10 text-white hover:bg-white/20 h-12 px-6 py-2"
                    >
                      Fale Conosco
                    </a>
                  </div>
                </div>
              </div>

              <div className="w-full lg:w-3/5 p-4 md:p-6 bg-gray-100">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 h-full">
                  {slide.mosaicImages && slide.mosaicImages.length > 0 ? (
                    slide.mosaicImages.map((item, i) => (
                      <Link
                        key={i}
                        href={`/produtos/${item.categorySlug}/${item.slug}`}
                        className="relative overflow-hidden rounded-lg bg-white shadow-sm hover:shadow-lg transition-all duration-300 group"
                      >
                        <div className="aspect-square relative overflow-hidden">
                          <img
                            src={item.url}
                            alt={item.alt}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="col-span-full flex items-center justify-center text-gray-500">
                      Nenhuma imagem disponível
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col lg:flex-row">
              <div className="w-full lg:w-2/5 pl-4 md:pl-8 lg:pl-16 pr-4 py-6 md:py-10 flex flex-col justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute inset-0" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                  }} />
                </div>
                <div className="relative z-10">
                  <p className="text-sm md:text-base font-semibold tracking-widest text-primary-foreground/80 mb-2">
                    {slide.subtitle}
                  </p>
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4 leading-tight">
                    {slide.title}
                  </h1>
                  <p className="text-sm md:text-base text-gray-300 mb-6 max-w-md">
                    {slide.description}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link
                      href={slide.href}
                      className="inline-flex items-center justify-center rounded-md text-sm font-semibold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-white text-gray-900 hover:bg-gray-100 h-12 px-6 py-2"
                    >
                      {slide.cta}
                    </Link>
                    <a
                      href={getWhatsAppUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-white/30 bg-white/10 text-white hover:bg-white/20 h-12 px-6 py-2"
                    >
                      Fale Conosco
                    </a>
                  </div>
                </div>
              </div>

              <div className="w-full lg:w-3/5 p-4 md:p-6 bg-gray-100">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 h-full">
                  {slide.products && slide.products.length > 0 ? (
                    slide.products.map((product) => (
                      <Link
                        key={product._id}
                        href={`/produtos/${(product.categories[0] as any)?.slug || 'produtos'}/${product.slug?.current || ''}`}
                        className="group relative overflow-hidden rounded-lg bg-white shadow-sm hover:shadow-lg transition-all duration-300"
                      >
                        <div className="aspect-square relative overflow-hidden">
                          {(() => {
                            const extImg = (product as any).externalImages?.[0]
                            const intImg = product.images?.[0] as any
                            const url = extImg?.url || intImg?.url
                            const alt = extImg?.alt || intImg?.alt || product.title
                            return url ? (
                              <>
                                <img
                                  src={url}
                                  alt={alt}
                                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                              </>
                            ) : (
                              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                <span className="text-gray-400 text-xs text-center p-2">{product.title}</span>
                              </div>
                            )
                          })()}
                        </div>
                        <div className="p-2">
                          <h3 className="text-xs font-medium text-gray-900 line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                            {product.title}
                          </h3>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="col-span-full flex items-center justify-center text-gray-500">
                      Nenhum produto disponível
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      ))}

      <button
        onClick={handlePrevious}
        className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full p-2 md:p-3 shadow-lg transition-all z-20"
      >
        <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
      </button>
      <button
        onClick={handleNext}
        className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full p-2 md:p-3 shadow-lg transition-all z-20"
      >
        <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
      </button>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === current ? "bg-primary w-6" : "bg-gray-400 hover:bg-gray-600"
            }`}
          />
        ))}
      </div>
    </div>
  )
}
