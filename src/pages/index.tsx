import { GetStaticProps } from "next";
import Head from "next/head";
import Image from "next/image";
import { HomeContainer, Product } from "../styles/pages/home";

import { useKeenSlider } from "keen-slider/react";

import "keen-slider/keen-slider.min.css";
import { stripe } from "../lib/stripe";
import Stripe from "stripe";
import Link from "next/link";

interface HomeProps {
  products: {
    id: string;
    name: string;
    imageUrl: string;
    price: string;
  }[];
}

export default function Home({ products }: HomeProps) {
  const [sliderRef] = useKeenSlider({
    slides: {
      perView: 3,
      spacing: 48,
    },
  });

  return (
    <>
      <Head>
        <title>Home | Ignite Shop</title>
      </Head>
      <HomeContainer ref={sliderRef} className="keen-slider">
        {products.map((product) => {
          return (
            <Link
              key={product.id}
              href={`/product/${product.id}`}
              prefetch={false}
            >
              <Product className="keen-slider__slide">
                <Image src={product.imageUrl} width={520} height={480} alt="" />
                <footer>
                  <strong>{product.name}</strong>
                  <span>{product.price}</span>
                </footer>
              </Product>
            </Link>
          );
        })}
      </HomeContainer>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  // PÁGINAS ESTÁTICAS SÃO PÁGINAS QUE TODOS OS USUÁRIOS TEM ACESSO, POR ISSO NÃO TEM CONTEXTO, NEM RES E NEM REQ
  // SE A PÁGINA PRECISA DE ALGUMA INFORMAÇÃO DE CONTEXTO, LOGO NÃO DÁ PRA SER UMA PÁGINA ESTÁTICA
  const response = await stripe.products.list({
    expand: ["data.default_price"],
  });

  const products = response.data.map((product) => {
    const { unit_amount } = product.default_price as Stripe.Price;

    return {
      id: product.id,
      name: product.name,
      imageUrl: product.images[0],
      price: new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(unit_amount ? unit_amount / 100 : 0),
    };
  });

  return {
    props: {
      products,
    },
    revalidate: 60 * 60 * 2,
  };
};
