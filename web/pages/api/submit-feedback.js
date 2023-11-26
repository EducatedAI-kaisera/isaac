/* eslint-disable import/no-anonymous-default-export */
export default async function (req, res) {
  const feedbackText = req.body.feedbackText;
  const userEmail = req.body.userEmail;

  const response = await fetch(
    'https://productlane.io/api/rpc/submitFeedback',
    {
      method: 'POST',
      headers: {
        Authorization: 'None',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        params: {
          text: `${feedbackText} `,
          email: `${userEmail}`,
          organizationName: 'aietal',
          painLevel: 'UNKNOWN',
        },
      }),
    },
  );

  const data = await response.json();

  console.log(response);

  res.status(200).json({ response: data });
}
