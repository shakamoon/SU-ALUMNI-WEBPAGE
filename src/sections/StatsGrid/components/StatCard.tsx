export type StatCardProps = {
  imageSrc: string;
  statValue: string;
  statLabel: string;
};

export const StatCard = (props: StatCardProps) => {
  return (
    <div className="flex flex-col items-center gap-4 py-4">
      <div className="w-16 h-16 shrink-0">
        <img src={props.imageSrc} alt="" className="w-full h-full object-contain" />
      </div>
      <div className="flex flex-col items-center gap-1">
        <span className="text-blue-800 text-3xl font-inter font-normal">{props.statValue}</span>
        <span className="text-gray-600 text-base font-inter">{props.statLabel}</span>
      </div>
    </div>
  );
};
