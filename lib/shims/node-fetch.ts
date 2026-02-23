const fetchShim: typeof fetch = (...args) => fetch(...args)

export default fetchShim
