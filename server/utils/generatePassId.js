const generatePassId = () => {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `BP-${year}-${randomNum}`;
};

const generateApplicationId = () => {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  return `APP-${year}-${randomNum}`;
};

module.exports = { generatePassId, generateApplicationId };
