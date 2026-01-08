import { useEffect, useState } from 'react';
import Papa from 'papaparse';

const Unpublished = () => {
  const [works, setWorks] = useState([]);

  useEffect(() => {
    Papa.parse('/unpublished.csv', {
      download: true,
      header: true,
      complete: (results) => {
        setWorks(results.data);
      }
    });
  }, []);

  return (
    <ul className="space-y-4 list-disc list-inside">
      {works.filter(w => w.Title).map((work, idx) => (
        <li key={idx} className="text-lg leading-relaxed pl-2">
          <span className="font-semibold">{work.Contributors}</span> ({work.Year}).{" "}
          <span className="italic">{work.Title}</span>. [Manuscript in preparation].
        </li>
      ))}
    </ul>
  );
};

export default Unpublished;