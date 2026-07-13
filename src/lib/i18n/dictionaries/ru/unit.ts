import type { unit as enUnit } from "../en/unit";

export const unit: typeof enUnit = {
  page: {
    title: "Данные подразделения",
    subtitle: "Обновите данные вашей регистрации ниже.",
  },
  sections: {
    personalDetails: "Личные данные",
    unitDetails: "Данные подразделения",
    coDetails: "Данные командира / заместителя",
  },
  fields: {
    firstName: "Имя",
    lastName: "Фамилия",
    rank: "Звание",
    unitType: "Тип подразделения",
    branch: "Род войск",
    unitName: "Название подразделения",
    arm: "Служба",
    secondPocEmail: "Эл. почта 2-го контактного лица",
    thirdPocEmail: "Эл. почта 3-го контактного лица (необязательно)",
    additionalInfo: "Дополнительная информация (необязательно)",
    coName: "Имя командира",
    coEmail: "Эл. почта командира",
    coPhone: "Телефон командира",
  },
  options: {
    regular: "Регулярное",
    reserve: "Резервное",
    army: "Сухопутные войска",
    navy: "Военно-морской флот",
    airForce: "Военно-воздушные силы",
  },
  placeholders: {
    selectUnit: "Выберите подразделение",
    select: "Выберите",
  },
  actions: {
    saveChanges: "Сохранить изменения",
  },
};
