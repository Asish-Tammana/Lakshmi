const { SmsParser } = require('./src/utils/SmsParser');

const testCases = [
    {
        name: "Refund",
        msg: "Rs. 100.00 refunded to your A/c X1234 from Amazon PAY",
        expected: { amount: 100, type: 'credit', merchant: 'Amazon PAY', isReversal: true }
    },
    {
        name: "Self Transfer",
        msg: "Transferred Rs. 500.00 to self",
        expected: { amount: 500, type: 'transfer', merchant: 'Self' }
    },
    {
        name: "A/c Transfer",
        msg: "A/c transfer Rs. 1000.00 to A/c X5432",
        expected: { amount: 1000, type: 'transfer', merchant: 'Self' }
    }
];

testCases.forEach(tc => {
    const result = SmsParser.parse(tc.msg);
    console.log(`Test: ${tc.name}`);
    console.log(`Message: ${tc.msg}`);
    console.log(`Result:`, result);
    const success = result &&
        result.amount === tc.expected.amount &&
        result.type === tc.expected.type &&
        result.merchant === tc.expected.merchant &&
        (tc.expected.isReversal ? result.isReversal === true : true);
    console.log(`Status: ${success ? 'PASS' : 'FAIL'}`);
    console.log('---');
});
