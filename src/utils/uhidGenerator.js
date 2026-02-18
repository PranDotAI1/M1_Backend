export const generateUHID = (sequence) => {
    const d = new Date();
    const yy = String(d.getFullYear()).slice(-2);
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const seq = sequence != null
        ? String(sequence).padStart(6, '0')
        : String(Math.floor(Math.random() * 1_000_000)).padStart(6, '0');
    return `${yy}${mm}${dd}${seq}`;
};
