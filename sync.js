const CDONClient = require('./lib/cdonClient');
const OngoingClient = require('./lib/ongoingClient');
const createLogClient = require('./lib/slackClient');

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

const handleOrder = async (
  logger,
  order,
  cdonClient,
  ongoingClient,
) => {
  const fileName = `CDON.${order.OrderId}.pdf`;
  const files = await ongoingClient.orderFiles(order.OngoingId);

  if (!hasFile(files, fileName)) {
    logger.log(
      `Order ${order.OrderId} DOES NOT have file ${fileName}`,
    );
    const pdfData = await cdonClient.deliveryNote(order);
    await ongoingClient.uploadDeliveryNote(
      order.OngoingId,
      fileName,
      pdfData,
    );
    logger.log(`Uploaded ${fileName} to order ${order.OrderId}`);
  }
};

const sync = async (cdonSettings, ongoingSettings, slackSettings) => {
  const logger = createLogClient(slackSettings);
  logger.log('Sync delivery notes from CDON to Ongoing');
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
  logger.log(
    `There are currently ${cdonOrders.length} pending CDON orders.`,
  );

  const mergedOrders = mergeOrders(cdonOrders, ongoingOrders).filter(o => o.OngoingId);

  await Promise.all(
    mergedOrders.map(order =>
      handleOrder(logger, order, cdonClient, ongoingClient),
    ),
  );

  await logger.print();
};

module.exports = sync;
