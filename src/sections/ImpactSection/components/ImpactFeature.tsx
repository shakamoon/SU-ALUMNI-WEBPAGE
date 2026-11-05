export type ImpactFeatureProps = {
  imageSrc: string;
  title: string;
  description: string;
};

export const ImpactFeature = (props: ImpactFeatureProps) => {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 shrink-0">
        <img src={props.imageSrc} alt="" className="w-full h-full object-contain" />
      </div>
      <div className="flex flex-col gap-0.5">
        <p className="text-blue-800 text-lg font-medium font-inter leading-[27px]">
          {props.title}
        </p>
        <p className="text-gray-600 text-sm font-inter leading-5">
          {props.description}
        </p>
      </div>
    </div>
  );
};
