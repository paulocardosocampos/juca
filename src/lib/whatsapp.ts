export function whatsappLink(phone: string, message: string): string {
  const digits = phone.replace(/\D/g, "");
  const full = digits.startsWith("55") ? digits : `55${digits}`;
  return `https://wa.me/${full}?text=${encodeURIComponent(message)}`;
}

export function partInterestMessage(part: {
  name: string;
  vehicle: { brand: string; model: string; modelYear: number };
}): string {
  return (
    `Olá! Vi no site do Juca Carros Velhos e tenho interesse na peça: ` +
    `*${part.name}* do ${part.vehicle.brand} ${part.vehicle.model} ${part.vehicle.modelYear}. ` +
    `Ainda está disponível?`
  );
}

export function vehicleInterestMessage(v: {
  brand: string;
  model: string;
  modelYear: number;
}): string {
  return (
    `Olá! Vi no site do Juca Carros Velhos o ${v.brand} ${v.model} ${v.modelYear} ` +
    `que está no pátio. Queria saber quais peças estão disponíveis.`
  );
}
