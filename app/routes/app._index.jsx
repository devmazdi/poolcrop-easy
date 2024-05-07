import { useEffect, useState } from "react";
import { json } from "@remix-run/node";
import { useActionData, useNavigation, useSubmit } from "@remix-run/react";
import {
  Page,
  Layout,
  Text,
  Card,
  Button,
  BlockStack,
  InlineStack,
  TextField,
  MediaCard,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { getProductByUrl } from "../utils/lib";

export const loader = async ({ request }) => {
  await authenticate.admin(request);

  return null;
};

export const action = async ({ request }) => {
  //const { admin } = await authenticate.admin(request);
  // const color = ["Red", "Orange", "Yellow", "Green"][
  //   Math.floor(Math.random() * 4)
  // ];
  // const response = await admin.graphql(
  //   `#graphql
  //     mutation populateProduct($input: ProductInput!) {
  //       productCreate(input: $input) {
  //         product {
  //           id
  //           title
  //           handle
  //           status
  //           variants(first: 10) {
  //             edges {
  //               node {
  //                 id
  //                 price
  //                 barcode
  //                 createdAt
  //               }
  //             }
  //           }
  //         }
  //       }
  //     }`,
  //   {
  //     variables: {
  //       input: {
  //         title: `${color} Snowboard`,
  //       },
  //     },
  //   },
  // );
  // const responseJson = await response.json();
  // const variantId =
  //   responseJson.data.productCreate.product.variants.edges[0].node.id;
  // const variantResponse = await admin.graphql(
  //   `#graphql
  //     mutation shopifyRemixTemplateUpdateVariant($input: ProductVariantInput!) {
  //       productVariantUpdate(input: $input) {
  //         productVariant {
  //           id
  //           price
  //           barcode
  //           createdAt
  //         }
  //       }
  //     }`,
  //   {
  //     variables: {
  //       input: {
  //         id: variantId,
  //         price: Math.random() * 100,
  //       },
  //     },
  //   },
  // );
  // const variantResponseJson = await variantResponse.json();

  // return json({
  //   product: responseJson.data.productCreate.product,
  //   variant: variantResponseJson.data.productVariantUpdate.productVariant,
  // });
  let postData = await request.json();
  console.log(postData);
  // get product by url 
  if(postData.type == 'search'){
    let pSiteUrl = postData.sUrl.trim();
    let poolProductData = await getProductByUrl(pSiteUrl);
    console.log(poolProductData);
    if(poolProductData.success){
      return json({productData: poolProductData.productData});
    }
    return json({message: "Something wrong with this product, please add manually"}); 
  }
  return json({message: "Something wrong with this product, please add manually"}); 
};

export default function Index() {
  const [url, setUrl] = useState('');
  const [productInfo, setProductInfo] = useState({});
  const nav = useNavigation();
  const actionData = useActionData();
  const submit = useSubmit();
  const isLoading =
    ["loading", "submitting"].includes(nav.state) && nav.formMethod === "POST";
  const productId = actionData?.product?.id.replace(
    "gid://shopify/Product/",
    "",
  );

  const rspMessage = actionData?.message;
  const poolPID = actionData?.productData?.id;
  useEffect(() => {
    if (rspMessage) {
      shopify.toast.show(actionData.message);
    }
    if(poolPID){
      setProductInfo(actionData.productData);
    }
    if(productId){
      setUrl('');
    }
  }, [actionData, rspMessage, poolPID,productId]);
  const generateProduct = () => submit({}, { replace: true, method: "POST" });

  const getPoolProduct = () => submit({type: 'search', sUrl: url}, { replace: true, method: "POST", encType: "application/json" });

  const addProduct = () => {
    let poolProductInfo = {type: 'add_product', ...productInfo};
    submit(poolProductInfo, { replace: true, method: "POST", encType: "application/json" });
  };
  
  return (
    <Page>
      <ui-title-bar title="Remix app template">
        <button variant="primary" onClick={generateProduct}>
          Generate a product
        </button>
      </ui-title-bar>
      <BlockStack gap="500">
        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="500">
              <BlockStack gap="200">
                  <Text as="h2" variant="headingMd">
                    Get product from pool360 url
                  </Text>
                  <TextField name="url" value={url} onChange={(value) => setUrl(value)} />
                </BlockStack>
                <InlineStack gap="300">
                  <Button loading={isLoading} onClick={getPoolProduct}>
                    Get product
                  </Button>
                  {actionData?.productID && (
                    <Button
                      url={`shopify:admin/products/${actionData.productID}`}
                      target="_blank"
                      variant="plain"
                    >
                      View product
                    </Button>
                  )}
                </InlineStack>
              </BlockStack>

              <BlockStack gap="500">
              {actionData?.productData && (
                <div style={{paddingTop: '30px'}}>
                <MediaCard
                title={actionData.productData.title}
                primaryAction={{
                  content: 'Add Product',
                  onAction: () => {addProduct()},
                }}
                description={actionData.productData.description}
                popoverActions={[{content: 'Dismiss', onAction: () => {}}]}
                size="small"
              >
                <img
                  alt=""
                  width="100%"
                  height="100%"
                  style={{
                    objectFit: 'cover',
                    objectPosition: 'center',
                  }}
                  src={actionData.productData.images[0]}
                />
              </MediaCard>
              </div>
              )}
              </BlockStack>                              
            </Card>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}
