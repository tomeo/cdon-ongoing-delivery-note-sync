const CDONClient = require('./lib/cdonClient');
const OngoingClient = require('./lib/ongoingClient');

const mergeOrders = (cdonOrders, ongoingOrders) =>
  cdonOrders.map(cdonOrder => {
    const ongoingOrder = ongoingOrders.find(
      ongoingOrder =>
        ongoingOrder.orderNumber === cdonOrder.OrderId.toString(),
    );
    if (ongoingOrder) cdonOrder.OngoingId = ongoingOrder.orderId;
    return cdonOrder;
  });

const hasFile = (files, fileName) =>
  files.some(file => file.fileName.endsWith(fileName));

const handleOrder = async (order, cdonClient, ongoingClient) => {
  const fileName = `CDON.${order.OrderId}.pdf`;
  const files = await ongoingClient.orderFiles(order.OngoingId);

  if (hasFile(files, fileName)) {
    console.log(`Order ${order.OrderId} HAS file ${fileName}`);
  } else {
    console.log(
      `Order ${order.OrderId} DOES NOT have file ${fileName}`,
    );
    const pdfData = await cdonClient.deliveryNote(order);
    await ongoingClient.uploadDeliveryNote(
      order.OngoingId,
      fileName,
      pdfData,
    );
    console.log(`Uploaded ${fileName} to order ${order.OrderId}`);
  }
};

const sync = async (cdonSettings, ongoingSettings) => {
  const cdonClient = new CDONClient(
    cdonSettings.apiUrl,
    cdonSettings.apiKey,
    cdonSettings.addressId,
  );
  const ongoingClient = new OngoingClient(
    ongoingSettings.apiUrl,
    ongoingSettings.goodsOwnerId,
    ongoingSettings.username,
    ongoingSettings.password,
  );

  const [cdonOrders, ongoingOrders] = await Promise.all([
    cdonClient.pendingOrders(),
    ongoingClient.pendingOrders(),
  ]);
  console.log(
    `There are currently ${cdonOrders.length} pending CDON orders.`,
  );

  const mergedOrders = mergeOrders(cdonOrders, ongoingOrders);
  return Promise.all(
    mergedOrders.map(order =>
      handleOrder(order, cdonClient, ongoingClient),
    ),
  );
};

module.exports = sync;
