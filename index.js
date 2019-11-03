const cdon = require('./lib/cdon');
const ongoing = require('./lib/ongoing');
const { CDON_ADDRESSID } = require('./config');

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
const cdonOrderToDeliveryNote = order => ({
  OrderId: order.OrderId,
  AddressId: CDON_ADDRESSID,
  DeliveryNoteRows: order.OrderRows.map(row => ({
    ProductId: row.ProductId,
    ProductName: row.ProductName,
    Quantity: row.Quantity,
  })),
});

Promise.all([cdon.pendingOrders(), ongoing.pendingOrders()])
  .then(([cdonResponse, ongoingResponse]) => {
    const cdonOrders = cdonResponse.data.map(
      order => order.OrderDetails,
    );
    const ongoingOrders = ongoingResponse.data.map(order => ({
      orderId: order.orderInfo.orderId,
      orderNumber: order.orderInfo.orderNumber,
    }));

    const mergedOrders = mergeOrders(cdonOrders, ongoingOrders);

    mergedOrders.forEach(order => {
      const fileName = `CDON.${order.OrderId}.pdf`;
      ongoing.orderFiles(order.OngoingId).then(({ data: files }) => {
        if (!files.some(file => file.fileName.endsWith(fileName))) {
          cdon
            .deliveryNote(cdonOrderToDeliveryNote(order))
            .then(({ data }) => {
              ongoing
                .uploadOrderFile(
                  order.OngoingId,
                  fileName,
                  'application/pdf',
                  base64(data),
                )
                .then(() =>
                  console.log(
                    `Uploaded ${fileName} to order ${order.OrderId}`,
                  ),
                );
            });
        } else {
          console.log(
            `Order ${order.OrderId} already has file ${fileName}`,
          );
        }
      });
    });
  })
  .catch(error => console.error(error));
