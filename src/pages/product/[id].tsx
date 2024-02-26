import { stripe } from "@/src/lib/stripe";
import {
  ImagemContainer,
  ProductContainer,
  ProductDetails,
} from "@/src/styles/pages/product";
import axios from "axios";
import { GetStaticPaths, GetStaticProps } from "next";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import { useState } from "react";
import Stripe from "stripe";

interface ProductProps {
  product: {
    id: string;
    name: string;
    imageUrl: string;
    price: string;
    description: string;
    defaultPriceId: string;
  };
}

export default function Product({ product }: ProductProps) {
  const [isCreatingCheckuotSession, setIsCreatingCheckuotSession] =
    useState(false);

  // const router = useRouter();

  async function handleBuyProduct() {
    try {
      setIsCreatingCheckuotSession(true);
      const response = await axios.post("/api/checkuot", {
        priceId: product.defaultPriceId,
      });

      const { checkuotUrl } = response.data;

      // PARA REDIRECIONAR PARA UMA ROTA INTERNA DO NEXT
      // router.push("/checkuot");

      // PARA REDIRECIONAR PARA UMA ROTA EXTERNA A APLICAÇÃO

      window.location.href = checkuotUrl;
    } catch (err) {
      // CONECTAR COM UMA FERRAMENTA DE OBSERVABILIDADE (DATADOG/ SENTRY)
      setIsCreatingCheckuotSession(false);

      alert("Falha ao redirecionar ao checkuot!");
    }
  }

  const { isFallback } = useRouter();

  if (isFallback) {
    return <p>Loding...</p>;
  }

  return (
    <>
      <Head>
        <title>{product.name} | Ignite Shop</title>
      </Head>
      <ProductContainer>
        <ImagemContainer>
          <Image src={product.imageUrl} width={520} height={480} alt="" />
        </ImagemContainer>
        <ProductDetails>
          <h1>{product.name}</h1>
          <span>{product.price}</span>

          <p>{product.description}</p>

          <button
            disabled={isCreatingCheckuotSession}
            onClick={handleBuyProduct}
          >
            Comprar agora
          </button>
        </ProductDetails>
      </ProductContainer>
    </>
  );
}

export const getStaticProps: GetStaticProps<any, { id: string }> = async ({
  params,
}) => {
  const productId = params?.id ?? "";

  const product = await stripe.products.retrieve(productId, {
    expand: ["default_price"],
  });

  const price = product.default_price as Stripe.Price;

  return {
    props: {
      product: {
        id: product.id,
        name: product.name,
        imageUrl: product.images[0],
        price: new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(price.unit_amount ? price.unit_amount / 100 : 0),
        description: product.description,
        defaultPriceId: price.id,
      },
    },
    revalidate: 60 * 60 * 1,
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  // BUSCAR OS PRODUTOS MAIS ACESSADOS DO ECOMERCE
  return {
    paths: [
      {
        params: {
          id: "prod_Pcdjr5ND3sgXNU",
        },
      },
    ],
    fallback: true,
  };
};
