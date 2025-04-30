import CryptoJS from 'crypto-js';
import { C as CRYPTO_KEY } from './private-B7JdlQ3D.js';
import { j as json } from './index-BIAFQWR9.js';
import { P as Product } from './product-DVzY65Xo.js';
import { C as CatProduct } from './catProduct-D_19IU5e.js';
import 'sequelize';
import 'path';

function decryptMenu(encryptedData) {
  const bytes = CryptoJS.AES.decrypt(encryptedData, CRYPTO_KEY);
  const decrypted = bytes.toString(CryptoJS.enc.Utf8);
  return JSON.parse(decrypted);
}
async function POST({ request }) {
  let updateApproved = false;
  const { encryptedMenu } = await request.json();
  try {
    const decodedMenu = atob(encryptedMenu);
    const decryptedMenu = decryptMenu(decodedMenu);
    const { cats, products } = decryptedMenu;
    if (cats && cats.length > 0 && (products && products.length > 0)) updateApproved = true;
    if (updateApproved) {
      await CatProduct.bulkCreate(
        cats.map((cat) => ({
          id: cat.id,
          name: cat.nombre
        })),
        {
          updateOnDuplicate: ["name"]
        }
      );
      await Product.bulkCreate(
        products.map((product) => ({
          id: product.id,
          name: product.nombre,
          image: product.image,
          price: product.precio,
          catproduct_id: product.catproducto_id
        })),
        {
          updateOnDuplicate: ["name", "image", "price", "catproduct_id"]
        }
      );
    }
    return json({ status: 200 });
  } catch (error) {
    console.error("Error during decryption:", error);
    return json({ error: "Invalid encrypted data" }, { status: 500 });
  }
}
async function DELETE() {
  try {
    await Product.destroy({
      where: {},
      truncate: true
    });
    await CatProduct.destroy({
      where: {},
      truncate: true
    });
    return json("Cats destroyed");
  } catch (error) {
    console.error("Error deleting: ", error);
    return json({ error: "Error deleting menu." }, { status: 500 });
  }
}

export { DELETE, POST };
//# sourceMappingURL=_server-CcataWqr.js.map
