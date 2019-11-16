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

const base64 = binary =>
  Buffer.from(binary, 'binary').toString('base64');

const cdonOrderToDeliveryNote = (order, addressId) => ({
  OrderId: order.OrderId,
  AddressId: addressId,
  DeliveryNoteRows: order.OrderRows.map(row => ({
    ProductId: row.ProductId,
    ProductName: row.ProductName,
    Quantity: row.Quantity,
  })),
});

module.exports = (cdonSettings, ongoingSettings) => {
  const cdonClient = new CDONClient(
    cdonSettings.apiUrl,
    cdonSettings.apiKey);
  const ongoingClient = new OngoingClient(
    ongoingSettings.apiUrl,
    ongoingSettings.goodsOwnerId,
    ongoingSettings.username,
    ongoingSettings.password);

  return Promise.all([cdonClient.pendingOrders(), ongoingClient.pendingOrders()])
  .then(([cdonResponse, ongoingResponse]) => {
    const cdonOrders = cdonResponse.data.map(
      order => order.OrderDetails,
    );
    console.log(`There are currently ${cdonOrders.length} pending CDON orders.`);
    const ongoingOrders = ongoingResponse.data.map(order => ({
      orderId: order.orderInfo.orderId,
      orderNumber: order.orderInfo.orderNumber,
    }));

    const mergedOrders = mergeOrders(cdonOrders, ongoingOrders);

    mergedOrders.forEach(order => {
      const fileName = `CDON.${order.OrderId}.pdf`;
      ongoingClient.orderFiles(order.OngoingId).then(({ data: files }) => {
        if (!files.some(file => file.fileName.endsWith(fileName))) {
          cdonClient.deliveryNote(cdonOrderToDeliveryNote(order, cdonSettings.addressId))
            .then(({ data }) => {
              ongoingClient.uploadOrderFile(order.OngoingId, fileName, 'application/pdf', base64(data))
                .then(() => console.log(`Uploaded ${fileName} to order ${order.OrderId}`));
            });
        } else {
          console.log(`Order ${order.OrderId} already has file ${fileName}`);
        }
      });
    });
  }); 
}
