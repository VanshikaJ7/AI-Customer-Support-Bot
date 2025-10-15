import React, { useState, useEffect } from 'react';

function FAQModal({ onClose }) {
  const [faqs, setFaqs] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/faqs')
      .then(res => res.json())
      .then(data => setFaqs(data));
  }, []);

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(search.toLowerCase()) ||
    faq.answer.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="faq-modal">
      <button onClick={onClose}>Close</button>
      <h2>Frequently Asked Questions</h2>
      <input
        type="text"
        placeholder="Search FAQs..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ width: '100%', marginBottom: '1em', padding: '0.5em' }}
      />
      <ul>
        {filteredFaqs.length === 0 ? (
          <li>No matching FAQs found.</li>
        ) : (
          filteredFaqs.map((faq, idx) => (
            <li key={idx} style={{ marginBottom: '1em' }}>
              <strong>Q: {faq.question}</strong>
              <br />
              <span>A: {faq.answer}</span>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

export default FAQModal;