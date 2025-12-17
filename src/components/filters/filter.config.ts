export const FILTER_FIELDS = [
  {
    field: "name",
    label: "Tên",
    type: "tag",     
  operators: ["is", "contains"],
 options: [
    { value: "Nguyen Van A", label: "Nguyễn Văn A" },
    { value: "Tran Thi B", label: "Trần Thị B" },
    { value: "Le Van C", label: "Lê Văn C" },
  ],
  },
  {
    field: "age",
    label: "Tuổi",
    type: "number",
    operators: ["is", ">", ">=", "<", "<=", "is_not", "range"],
  },
  {
    field: "department",
    label: "Phòng",
    type: "select",
    operators: ["is", "is_not"],
    options: [
      { value: "it", label: "IT" },
      { value: "hr", label: "HR" },
      { value: "sale", label: "Sale" },
      { value: "long", label: "Long tag" },
      { value: "verylong", label: "Very longggggggggg" },
    ],
  },
  {
    field: "order_date",
    label: "Ngày order",
    type: "date",
    operators: ["range", "is", ">", ">=", "<", "<=", "is_not"],
  },
];
