export const faqItems = [
  {
    question: 'Do guests need to create an account?',
    answer:
      'No. Guests open the shared list link, pick a gift, and enter their name. No sign-up required.',
  },
  {
    question: 'Can guests see who claimed each gift?',
    answer:
      'No. Guests only see whether an item is available or already selected. Only the list host sees claimer names.',
  },
  {
    question: 'Which stores can I import products from?',
    answer:
      'Paste a link from most online stores. Amazon and Next are supported with dedicated parsers; other sites use standard product metadata when available.',
  },
  {
    question: 'What if a product link fails to import?',
    answer:
      'Some retailers block automated fetching. Try the direct product page URL, or add the item details manually after creating the list.',
  },
  {
    question: 'Can a guest unclaim a gift?',
    answer:
      'Yes. From the same browser they used to claim, they can unclaim their selection. The gift becomes available again for others.',
  },
  {
    question: 'Can the host claim a gift on behalf of someone?',
    answer:
      'Yes. From the manage view, hosts can claim items on behalf of a guest — useful when coordinating in person or by phone.',
  },
  {
    question: 'How do I share my list with guests?',
    answer:
      'Copy the guest link from your manage page and send it by text, email, or invitation. Guests use that link — not the manage URL.',
  },
  {
    question: 'Do lists update in real time?',
    answer:
      'Yes. When someone claims or unclaims a gift, other open list pages update automatically without refreshing.',
  },
  {
    question: 'Can I export my list after the shower?',
    answer:
      'Yes. Hosts can export a PDF from the manage page with every item, claim status, guest name, and claim date — handy for thank-you notes.',
  },
  {
    question: 'Is WishesDream free?',
    answer:
      'Yes. Create a list, share it with guests, and manage claims at no cost.',
  },
] as const;
