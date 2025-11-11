import React, { useState, useEffect } from "react";
import "../styles/Catalog.css";

const Catalog = () => {
    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState("");
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [selectedBrands, setSelectedBrands] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);

    useEffect(() => {
        fetch("http://localhost:3030/api/catalog")
            .then((res) => res.json())
            .then((data) => {
                setProducts(data);
                setFilteredProducts(data.slice(0, 100));
                const uniqueCategories = [...new Set(data.flatMap((p) => p.category))];
                setCategories(uniqueCategories);
                const uniqueBrands = [...new Set(data.map((p) => p.brand).filter(Boolean))];
                setBrands(uniqueBrands);
            });
    }, []);

    useEffect(() => {
        let filtered = products.filter((p) =>
            p.sku.toLowerCase().includes(search.toLowerCase()) ||
            p.descriptions.some((desc) => desc.toLowerCase().includes(search.toLowerCase()))
        );

        if (selectedCategories.length > 0) {
            filtered = filtered.filter((p) => selectedCategories.some(cat => p.category.includes(cat)));
        }

        if (selectedBrands.length > 0) {
            filtered = filtered.filter((p) => selectedBrands.includes(p.brand));
        }

        setFilteredProducts(filtered.slice(0, 100));
    }, [search, selectedCategories, selectedBrands, products]);

    const handleCategoryChange = (e) => {
        const value = e.target.value;
        setSelectedCategories((prev) =>
            prev.includes(value) ? prev.filter((cat) => cat !== value) : [...prev, value]
        );
    };

    const handleBrandChange = (e) => {
        const value = e.target.value;
        setSelectedBrands((prev) =>
            prev.includes(value) ? prev.filter((brand) => brand !== value) : [...prev, value]
        );
    };

    return (
        <div className="p-4">
            <div className="filter-container">
                <input
                    type="text"
                    placeholder="Search..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="border p-2 rounded w-1/2"
                />

                <div className="filter-box">
                    <label className="font-bold block">Categories</label>
                    {categories.map((cat) => (
                        <div key={cat}>
                            <input
                                type="checkbox"
                                value={cat}
                                checked={selectedCategories.includes(cat)}
                                onChange={handleCategoryChange}
                            /> {cat}
                        </div>
                    ))}
                </div>

                <div className="filter-box">
                    <label className="font-bold block">Brands</label>
                    {brands.map((b) => (
                        <div key={b}>
                            <input
                                type="checkbox"
                                value={b}
                                checked={selectedBrands.includes(b)}
                                onChange={handleBrandChange}
                            /> {b}
                        </div>
                    ))}
                </div>
            </div>

            {selectedProduct ? (
                <div className="product-detail">
                    <button onClick={() => setSelectedProduct(null)} className="close-btn">Back to Catalog</button>
                    <img src={selectedProduct.image ? `http://localhost:3030${selectedProduct.image}` : "placeholder.jpg"} alt={selectedProduct.sku} />
                    <h2>{selectedProduct.sku}</h2>
                    <p>{selectedProduct.descriptions.join(", ")}</p>
                    <p><strong>Manufacturer:</strong> {selectedProduct.manufacturer}</p>
                    <p><strong>Brand:</strong> {selectedProduct.brand}</p>
                    <p><strong>Category:</strong> {selectedProduct.category.join(", ")}</p>
                    <p><strong>Features:</strong> {selectedProduct.features.join(", ")}</p>
                    <p><strong>UPC:</strong> {selectedProduct.upc}</p>
                    <p><strong>MFG Part Number:</strong> {selectedProduct.mfgPartNumber}</p>
                    <p><strong>Country of Origin:</strong> {selectedProduct.countryOfOrigin}</p>
                    <p><strong>Standard Pack:</strong> {selectedProduct.standardPack}</p>
                </div>
            ) : (
                <div className="grid-container">
                    {filteredProducts.map((product) => (
                        <div key={product.sku} className="product-card" onClick={() => setSelectedProduct(product)}>
                            <img
                                src={product.image ? `http://localhost:3030${product.image}` : "placeholder.jpg"}
                                alt={product.sku}
                                onError={(e) => e.target.src = "placeholder.jpg"}
                            />
                            <h2 className="font-bold mt-2">{product.sku}</h2>
                            <p className="text-sm">{product.descriptions.join(", ")}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Catalog;